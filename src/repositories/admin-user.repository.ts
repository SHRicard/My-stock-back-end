import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {AdminUser} from '../models';

export class AdminUserRepository extends DefaultCrudRepository<
  AdminUser,
  typeof AdminUser.prototype.id
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(AdminUser, dataSource);
  }
}
