import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  HttpErrors,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {startOfMonth} from 'date-fns';
import moment from 'moment';
import {GlobalLog, WorkRecord} from '../models';
import {UsersRepository, WorkRecordRepository} from '../repositories';
import {GlobalLogService} from '../services/global-log.service';
import {CalculateWorkHours} from '../utils/CalculateWorkHours';

const monthsMap: {[key: string]: number} = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

export class WorkRecordController {
  constructor(
    @repository(WorkRecordRepository)
    public workRecordRepository: WorkRecordRepository,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
    @inject('services.GlobalLogService')
    public globalLogService: GlobalLogService,
  ) {}

  //Todo los Documentos Activos
  @get('/work-records/active')
  @response(200, {
    description: 'Array of active WorkRecord model instances with pagination',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {type: 'string'},
                  profile: {
                    type: 'object',
                    properties: {
                      id: {type: 'string'}, // ID del trabajador
                      name: {type: 'string'}, // Nombre del trabajador
                      surName: {type: 'string'}, // Apellido del trabajador
                      documents: {type: 'string'}, // Documento del trabajador
                    },
                  },
                  workDate: {type: 'string'}, // Fecha del día trabajado
                  startTime: {type: 'string'}, // Hora de inicio
                  endTime: {type: 'string'}, // Hora de salida (opcional)
                  totalHours: {type: 'number'}, // Total de horas trabajadas
                  description: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: {type: 'string'}, // Fecha de la descripción
                        details: {type: 'string'}, // Detalles
                      },
                    },
                  },
                  status: {type: 'string'}, // Estado del registro
                },
              },
            },
            totalItems: {type: 'number'},
            totalPages: {type: 'number'},
          },
        },
      },
    },
  })
  async findActiveWorkRecords(
    @param.query.number('limit') limit: number = 10,
    @param.query.number('page') page: number = 1,
  ): Promise<object> {
    const skip = (page - 1) * limit;

    const filter = {
      where: {status: 'activo'},
      limit: limit,
      skip: skip,
    };

    const totalActiveRecords = await this.workRecordRepository.count({
      status: 'activo',
    });

    const totalPages = Math.ceil(totalActiveRecords.count / limit);
    const activeRecords = await this.workRecordRepository.find(filter);

    return {
      data: activeRecords.length ? activeRecords : [],
      totalItems: totalActiveRecords.count,
      totalPages: totalPages,
    };
  }

  //crear documentos
  @post('/work-records/start-worker-hours')
  @response(200, {
    description: 'WorkRecord model instance',
    content: {'application/json': {schema: {'x-ts-type': WorkRecord}}},
  })
  async createWorkRecord(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                required: ['id', 'name', 'surName', 'documents'],
                properties: {
                  id: {type: 'string'},
                  name: {type: 'string'},
                  surName: {type: 'string'},
                  documents: {type: 'string'},
                },
              },
              status: {type: 'string', default: 'activo'},
            },
            required: ['profile'],
          },
        },
      },
    })
    workRecordData: {
      profile: {
        id: string;
        name: string;
        surName: string;
        documents: string;
      };
      status?: string;
    },
  ): Promise<WorkRecord> {
    const workDate = moment().startOf('day').toDate();
    const startTime = moment().toDate();
    const userId = workRecordData.profile.id;
    const dataWithUserId = {
      ...workRecordData,
      userId,
      workDate,
      startTime,
    };

    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'documentos',
        operation: 'Inicio de Hora Trabajada',
        entityId: 'id',
        changes: {
          data: `día: ${moment(workDate).format('YYYY-MM-DD')}, inicio: ${moment(startTime).format('HH:mm:ss')}`,
          message: `El Documento se creó con éxito`,
        },
        date: moment().toISOString(),
      }),
    );
    await this.usersRepository.updateById(userId, {isActive: true});
    return this.workRecordRepository.create(dataWithUserId);
  }
  // agregar documentos
  @post('/work-records/add-details')
  async addDetails(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              newDetails: {
                type: 'object',
                properties: {
                  registerId: {type: 'string'},
                  details: {type: 'string'},
                },
                required: ['registerId', 'details'],
              },
            },
          },
        },
      },
    })
    body: {
      newDetails: {registerId: string; details: string};
    },
  ): Promise<void> {
    const {registerId, details} = body.newDetails;

    const workRecord = await this.workRecordRepository.findById(registerId);
    if (!workRecord) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'documentos',
          operation: 'Se Agregar Nota',
          entityId: registerId,
          changes: {
            data: `${details}`,
            message: `El Documentos no existe`,
          },
          date: moment().toISOString(),
        }),
      );
      throw new HttpErrors.NotFound(
        `WorkRecord con id ${registerId} no encontrado`,
      );
    }

    if (!workRecord.description) {
      workRecord.description = [];
    }

    const currentDate = new Date();
    workRecord.description.push({
      date: currentDate,
      details,
    });

    const addDetails = await this.workRecordRepository.updateById(registerId, {
      description: workRecord.description,
    });
    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'documentos',
        operation: 'Se Agregar Nota',
        entityId: registerId,
        changes: {
          data: `${details}`,
          message: `El Documentos creado`,
        },
        date: moment().toISOString(),
      }),
    );
    return addDetails;
  }
  // FIn de dia laboral
  @post('/work-records/end-worker-hours')
  async endWork(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: {type: 'string'},
            },
            required: ['id'],
          },
        },
      },
    })
    body: {
      id: string;
    },
  ): Promise<void> {
    const {id} = body;

    const workRecord = await this.workRecordRepository.findOne({
      where: {
        userId: id,
        status: 'activo',
      },
    });

    if (!workRecord) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'documentos',
          operation: 'Fin de Hora Trabajada',
          entityId: id,
          changes: {
            data: `${id}`,
            message: `El Documento no existe`,
          },
          date: moment().toISOString(),
        }),
      );

      throw new HttpErrors.NotFound(`WorkRecord con id ${id} no encontrado`);
    }

    const endTime = moment();
    const startTime = moment(workRecord.startTime);
    const totalHours = CalculateWorkHours(startTime, endTime);

    workRecord.endTime = endTime.toDate();
    workRecord.totalHours = totalHours;
    workRecord.status = 'finalizado';

    const updateHours = await this.workRecordRepository.updateById(
      workRecord.id,
      workRecord,
    );

    // Crear un log de la operación realizada
    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'documentos',
        operation: 'Fin de Hora Trabajada',
        entityId: id,
        changes: {
          data: `día que terminó: ${moment(endTime).format('YYYY-MM-DD HH:mm:ss')}, total de horas trabajadas: ${totalHours}, estado: finalizado`,
          message: `El Documento ha sido actualizado`,
        },
        date: moment().toISOString(),
      }),
    );

    await this.usersRepository.updateById(id, {isActive: false});

    return updateHours;
  }
  //Close Records
  @post('/work-records/close-records')
  async closeWorkRecord(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              recordId: {type: 'string'},
              userId: {type: 'string'},
            },
            required: ['recordId', 'userId'],
          },
        },
      },
    })
    body: {
      recordId: string;
      userId: string;
    },
  ): Promise<void> {
    const {recordId, userId} = body;

    const workRecord = await this.workRecordRepository.findOne({
      where: {
        id: recordId,
        userId: userId,
        status: 'activo',
      },
    });

    if (!workRecord) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'documentos',
          operation: 'Fin de Hora Trabajada',
          entityId: recordId,
          changes: {
            data: `Record ID: ${recordId}, User ID: ${userId}`,
            message: `El registro de trabajo no existe o ya está finalizado.`,
          },
          date: moment().toISOString(),
        }),
      );

      throw new HttpErrors.NotFound(
        `Registro de trabajo con id ${recordId} y usuario ${userId} no encontrado`,
      );
    }

    const endTime = moment();
    const startTime = moment(workRecord.startTime);
    const totalHours = CalculateWorkHours(startTime, endTime);

    workRecord.endTime = endTime.toDate();
    workRecord.totalHours = totalHours;
    workRecord.status = 'finalizado';

    await this.workRecordRepository.updateById(workRecord.id, workRecord);

    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'documentos',
        operation: 'Fin de Hora Trabajada',
        entityId: recordId,
        changes: {
          data: `día que terminó: ${moment(endTime).format('YYYY-MM-DD HH:mm:ss')}, total de horas trabajadas: ${totalHours}, estado: finalizado`,
          message: `El registro de trabajo ha sido actualizado correctamente`,
        },
        date: moment().toISOString(),
      }),
    );

    await this.usersRepository.updateById(userId, {isActive: false});

    return;
  }

  // Obtener todos los WorkRecords de un usuario específico
  @get('/work-hours/all-record/{userId}', {
    responses: {
      '200': {
        description:
          'Array of WorkRecord model instances for the given user, paginated and filtered by current month',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                totalRecords: {type: 'number'},
                totalPages: {type: 'number'},
                currentPage: {type: 'number'},
                data: {
                  type: 'array',
                  items: {'x-ts-type': WorkRecord},
                },
              },
            },
          },
        },
      },
    },
  })
  async getAllRecordsByUserId(
    @param.path.string('userId') userId: string,
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
  ): Promise<{
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    data: WorkRecord[];
  }> {
    try {
      const skip = (page - 1) * limit;

      const currentMonthStart = startOfMonth(new Date());
      const today = new Date();
      const totalRecords = await this.workRecordRepository.count({
        userId: userId,
        workDate: {
          gte: new Date(currentMonthStart),
          lte: new Date(today),
        },
      });

      if (totalRecords.count === 0) {
        return {totalRecords: 0, totalPages: 0, currentPage: page, data: []};
      }

      const workRecords = await this.workRecordRepository.find({
        where: {
          userId: userId,
          workDate: {
            gte: new Date(currentMonthStart),
            lte: new Date(today),
          },
        },
        skip: skip,
        limit: limit,
        order: ['id DESC'],
      });

      const totalPages = Math.ceil(totalRecords.count / limit);

      return {
        totalRecords: totalRecords.count,
        totalPages: totalPages,
        currentPage: page,
        data: workRecords.length > 0 ? workRecords : [],
      };
    } catch (error) {
      console.error('Error al obtener los registros de trabajo:', error);
      throw error;
    }
  }
  //filtro por mes
  @get('/work-hours/search/months', {
    responses: {
      '200': {
        description:
          'Array of WorkRecord model instances for the selected month and user, paginated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                totalPages: {type: 'number'},
                totalLogs: {type: 'number'},
                data: {
                  type: 'array',
                  items: {
                    'x-ts-type': WorkRecord,
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async findWorkHoursByMonth(
    @param.query.string('userId') userId: string,
    @param.query.string('search') searchTerm: string,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('page') page: number = 1,
  ): Promise<{
    totalPages: number;
    totalLogs: number;
    data: WorkRecord[] | string[];
  }> {
    if (!searchTerm || !userId) {
      return {totalPages: 0, totalLogs: 0, data: []};
    }

    const monthIndex = monthsMap[searchTerm.toLowerCase()];
    if (monthIndex === undefined) {
      throw new Error('Mes inválido');
    }

    const year = moment().year();
    const startDate = moment([year, monthIndex]).startOf('month').toDate();
    const endDate = moment([year, monthIndex])
      .add(1, 'months')
      .startOf('month')
      .toDate();

    const skip = (page - 1) * limit;

    const workHours = await this.workRecordRepository.find({
      where: {
        userId: userId,
        workDate: {
          between: [startDate, endDate],
        },
      },
      skip: skip,
      limit: limit,
      order: ['id DESC'],
    });

    const totalWorkHours = await this.workRecordRepository.count({
      userId: userId,
      workDate: {
        between: [startDate, endDate],
      },
    });

    const totalPages = Math.ceil(totalWorkHours.count / limit);

    if (workHours.length === 0) {
      return {
        totalPages: 1,
        totalLogs: 0,
        data: [`SIN DATOS PARA EL MES DE ${searchTerm.toUpperCase()}`],
      };
    }
    return {
      totalPages,
      totalLogs: totalWorkHours.count,
      data: workHours,
    };
  }
}
