import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  put,
  requestBody,
  response,
  Response,
  RestBindings,
} from '@loopback/rest';
import moment from 'moment';
import {GlobalLog, Users} from '../models';
import {UsersRepository} from '../repositories';
import {GlobalLogService} from '../services/global-log.service';

export class UsersController {
  constructor(
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,
    @inject('services.GlobalLogService')
    public globalLogService: GlobalLogService,
  ) {}

  //create users
  @post('/users/create')
  @response(201, {
    description: 'Users model instance',
    content: {'application/json': {schema: getModelSchemaRef(Users)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              surName: {type: 'string'},
              documents: {type: 'string'},
              role: {type: 'string'},
              isActive: {type: 'boolean'},
            },
            required: ['name', 'surName', 'documents', 'isActive', 'role'],
          },
        },
      },
    })
    newUser: Omit<Users, 'id'>,
  ): Promise<Users | object> {
    const existingUser = await this.usersRepository.findOne({
      where: {documents: newUser.documents},
    });

    if (existingUser) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'users',
          operation: 'Creacion de Personal',
          entityId: existingUser.id,
          changes: {
            data: `${existingUser.id}`,
            message: `Ya existe un trabajador con el documento ${newUser.documents}`,
          },
          date: moment().toISOString(),
        }),
      );
      throw new HttpErrors.Conflict(
        `Ya existe un trabajador con el documento ${newUser.documents}`,
      );
    }
    const userCreate = await this.usersRepository.create(newUser);
    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'users',
        operation: 'Creacion de Personal',
        entityId: userCreate.id,
        changes: {
          data: `${userCreate.id}`,
          message: `documents: ${newUser.documents},name: ${newUser.name} , surName: ${newUser.surName}`,
        },
        date: moment().toISOString(),
      }),
    );
    return userCreate;
  }
  @get('/users')
  async findUsers(
    @param.query.number('limit') limit: number = 10,
    @param.query.number('page') page: number = 1,
  ): Promise<object> {
    const skip = (page - 1) * limit;

    const filter = {
      limit: limit,
      skip: skip,
    };

    const totalUsers = await this.usersRepository.count();
    const totalPages = Math.ceil(totalUsers.count / limit);
    const users = await this.usersRepository.find(filter);

    return {
      data: users,
      totalItems: totalUsers.count,
      totalPages: totalPages,
    };
  }
  //get filter for users
  @get('/users/search')
  async searchUsers(
    @param.query.string('name') name: string,
    @param.query.number('limit') limit: number = 10,
    @param.query.number('page') page: number = 1,
  ): Promise<object> {
    const skip = (page - 1) * limit;

    const filter = {
      limit: limit,
      skip: skip,
      where: {
        name: {
          like: `${name}.*`,
        },
      },
    };

    const totalUsers = await this.usersRepository.count(filter.where);

    const totalPages = Math.ceil(totalUsers.count / limit);

    const users = await this.usersRepository.find(filter);

    return {
      data: users,
      totalItems: totalUsers.count,
      totalPages: totalPages,
    };
  }
  //delete user
  @del('/users/delete/{id}')
  @response(204, {
    description: 'Usuario eliminado con éxito',
  })
  async deleteUserById(@param.path.string('id') id: string): Promise<void> {
    const userExists = await this.usersRepository.exists(id);
    if (!userExists) {
      throw new Error('El usuario no existe.');
    }
    const deleteUser = this.usersRepository.deleteById(id);
    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'users',
        operation: 'Borrar Personal',
        entityId: id,
        changes: {
          data: `${id}`,
          message: `Usuario Borrado`,
        },
        date: moment().toISOString(),
      }),
    );
    return deleteUser;
  }

  // Actualizar Personal
  @put('/users/update/{id}')
  @response(204, {
    description: 'User updated successfully',
  })
  async updateUser(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              surName: {type: 'string'},
              documents: {type: 'string'},
              role: {type: 'string'},
            },
            required: ['name', 'surName', 'documents'],
          },
        },
      },
    })
    user: Partial<Users>,
  ): Promise<void> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      await this.globalLogService.createLogEntry(
        new GlobalLog({
          module: 'users',
          operation: 'Actualización de Personal',
          entityId: id,
          changes: {
            data: `${id}`,
            message: `el usuario no existe`,
          },
          date: moment().toISOString(),
        }),
      );

      throw new HttpErrors.NotFound('Usuario no encontrado');
    }

    if (existingUser.documents !== user.documents) {
      const userWithSameDocument = await this.usersRepository.findOne({
        where: {documents: user.documents, id: {neq: id}},
      });

      if (userWithSameDocument) {
        await this.globalLogService.createLogEntry(
          new GlobalLog({
            module: 'users',
            operation: 'Actualización de Personal',
            entityId: id,
            changes: {
              data: `${user.documents}`,
              message: `Ya existe un usuario con el documento: ${user.documents}`,
            },
            date: moment().toISOString(),
          }),
        );
        throw new HttpErrors.Conflict(
          `Ya existe un usuario con el documento: ${user.documents}`,
        );
      }
    }

    const updateUser = await this.usersRepository.updateById(id, user);
    await this.globalLogService.createLogEntry(
      new GlobalLog({
        module: 'users',
        operation: 'Actualización de Personal',
        entityId: id,
        changes: {
          data: `${user.documents}`,
          message: `El usuario fue actualizado correctamente`,
        },
        date: moment().toISOString(),
      }),
    );
    return updateUser;
  }
  //Obtener un usuario por ID
  @get('/users/search/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': Users,
            },
          },
        },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Users> {
    return this.usersRepository.findById(id);
  }
}
