import {repository} from '@loopback/repository';
import {post, requestBody, response} from '@loopback/rest';
import {genSaltSync, hashSync} from 'bcryptjs';
import {AdminUser} from '../models';
import {AdminUserRepository} from '../repositories';

export class AdminUserControllerController {
  constructor(
    @repository(AdminUserRepository)
    public adminUserRepository: AdminUserRepository,
  ) {}
  @post('/admin-users')
  @response(200, {
    description: 'AdminUser model instance',
    content: {'application/json': {schema: {}}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              username: {type: 'string'},
              name: {type: 'string'},
              password: {type: 'string'},
              email: {type: 'string'},
              role: {type: 'string'},
            },
            required: ['username', 'name', 'password', 'email', 'role'],
          },
        },
      },
    })
    adminUser: Omit<AdminUser, 'id'>,
  ): Promise<AdminUser> {
    const salt = genSaltSync(10);
    adminUser.password = hashSync(adminUser.password, salt);

    return this.adminUserRepository.create(adminUser);
  }
}
