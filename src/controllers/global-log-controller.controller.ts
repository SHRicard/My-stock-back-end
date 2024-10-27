import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import {endOfMonth, startOfMonth} from 'date-fns';
import {writeFileSync} from 'fs';
import moment from 'moment';
import {GlobalLog} from '../models';
import {
  GlobalLogRepository,
  ProductsRepository,
  WorkRecordRepository,
} from '../repositories';
import {GlobalLogService} from '../services/global-log.service';

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

export class GlobalLogControllerController {
  constructor(
    @repository(GlobalLogRepository)
    public globalLogRepository: GlobalLogRepository,
    @repository(WorkRecordRepository)
    public workRecordRepository: WorkRecordRepository,
    @repository(ProductsRepository)
    public productsRepository: ProductsRepository,
    @inject(RestBindings.Http.RESPONSE) private res: Response,
    @inject('services.GlobalLogService')
    private globalLogService: GlobalLogService,
  ) {}
  //All Logs
  @get('/global-logs', {
    responses: {
      '200': {
        description: 'Array of GlobalLog model instances',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                totalPages: {type: 'number'},
                data: {
                  type: 'array',
                  items: getModelSchemaRef(GlobalLog, {includeRelations: true}),
                },
              },
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
  ): Promise<{totalPages: number; data: GlobalLog[]}> {
    const skip = (page - 1) * limit;

    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());

    const data = await this.globalLogRepository.find({
      where: {
        date: {
          between: [startDate.toISOString(), endDate.toISOString()],
        },
      },
      skip: skip,
      limit: limit,
      order: ['id DESC'],
    });

    const totalCount = await this.globalLogRepository.count({
      date: {
        between: [startDate.toISOString(), endDate.toISOString()],
      },
    });

    const totalPages = Math.ceil(totalCount.count / limit);

    return {
      totalPages,
      data,
    };
  }
  // search Logs For months
  @get('/globalLogs/search/months', {
    responses: {
      '200': {
        description:
          'Array of GlobalLog model instances for the selected month, paginated',
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
                    'x-ts-type': GlobalLog,
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async findLogsByMonth(
    @param.query.string('month') month?: string,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('page') page: number = 1,
  ): Promise<{totalPages: number; totalLogs: number; data: GlobalLog[]}> {
    if (!month) {
      return {totalPages: 0, totalLogs: 0, data: []};
    }

    if (!(month.toLowerCase() in monthsMap)) {
      throw new Error('Mes inválido');
    }

    const year = new Date().getFullYear();
    const monthIndex = monthsMap[month.toLowerCase()];

    const startDate = startOfMonth(new Date(year, monthIndex, 1));
    const endDate = endOfMonth(new Date(year, monthIndex, 1));

    const skip = (page - 1) * limit;

    const logs = await this.globalLogRepository.find({
      where: {
        date: {
          between: [startDate.toISOString(), endDate.toISOString()],
        },
      },
      skip,
      limit,
      order: ['id DESC'],
    });

    const totalLogs = await this.globalLogRepository.count({
      date: {
        between: [startDate.toISOString(), endDate.toISOString()],
      },
    });

    const totalPages = Math.ceil(totalLogs.count / limit);

    return {
      totalPages,
      totalLogs: totalLogs.count,
      data: logs,
    };
  }

  // Ruta para generar el backup
  @post('/globalLogs/backup', {
    responses: {
      '200': {
        description: 'Backup generado correctamente',
        content: {'application/json': {schema: {type: 'object'}}},
      },
    },
  })
  async generateBackup(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              startDate: {type: 'string', format: 'date'},
              endDate: {type: 'string', format: 'date'},
            },
            required: ['startBackup', 'endBackup'],
          },
        },
      },
    })
    backupRequest: {
      startBackup: string;
      endBackup: string;
    },
  ): Promise<Response> {
    const startDate = moment(backupRequest.startBackup).startOf('day').toDate();
    const endDate = moment(backupRequest.endBackup).endOf('day').toDate();

    const workRecordsBackup = await this.workRecordRepository.find({
      where: {
        workDate: {
          between: [startDate, endDate],
        },
      },
    });

    const productsBackup = await this.productsRepository.find({
      where: {
        create: {
          between: [startDate, endDate],
        },
      },
    });

    if (workRecordsBackup.length === 0 && productsBackup.length === 0) {
      return this.res.status(200).json({
        message: `No hay datos para generar un backup desde ${backupRequest.startBackup} hasta ${backupRequest.endBackup}`,
      });
    }

    const backupData = {
      products: productsBackup.length > 0 ? productsBackup : [],
      workRecords: workRecordsBackup.length > 0 ? workRecordsBackup : [],
    };

    const currentDate = moment().format('YYYY-MM-DD');
    const filePath = `backup-${currentDate}.json`;
    writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'backup',
        operation: 'Generación de Backup',
        entityId: 'backup-' + currentDate,
        changes: {
          data: `Backup generado desde ${backupRequest.startBackup} hasta ${backupRequest.endBackup}`,
          message: `El backup se generó con éxito en el archivo: ${filePath}`,
        },
        date: moment().toISOString(),
      }),
    );

    this.res.download(filePath, `backup-${currentDate}.json`, err => {
      if (err) {
        const errorCode = (err as any).code;
        if (errorCode === 'ECONNABORTED') {
          return;
        }
        console.error('Error al descargar el archivo:', err);

        if (!this.res.headersSent) {
          return this.res
            .status(500)
            .send({message: 'Error descargando el archivo.'});
        }
      }
    });

    return this.res;
  }
}
