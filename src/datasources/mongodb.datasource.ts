import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';

dotenv.config();

// Selecciona el nombre de la base de datos según el entorno
const dbName =
  process.env.NODE_ENV === 'production'
    ? process.env.DB_NAME_PROD
    : process.env.DB_NAME_DEMO;

const config = {
  name: process.env.NAME ?? 'mongodb',
  connector: process.env.CONNECTOR ?? 'mongodb',
  url: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${dbName}?${process.env.DB_OPTIONS}`,
  useNewUrlParser: true,
};

@lifeCycleObserver('datasource')
export class MongodbDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'mongodb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongodb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
