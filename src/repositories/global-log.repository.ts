import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {GlobalLog, GlobalLogRelations} from '../models';

export class GlobalLogRepository extends DefaultCrudRepository<
  GlobalLog,
  typeof GlobalLog.prototype.id,
  GlobalLogRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(GlobalLog, dataSource);
  }
}
