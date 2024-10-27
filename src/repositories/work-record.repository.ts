import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {WorkRecord, WorkRecordRelations} from '../models';

export class WorkRecordRepository extends DefaultCrudRepository<
  WorkRecord,
  typeof WorkRecord.prototype.id,
  WorkRecordRelations
> {
  patchById(
    registerId: string,
    arg1: {description: {date: Date; details: string}[]},
  ) {
    throw new Error('Method not implemented.');
  }
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(WorkRecord, dataSource);
  }
}
