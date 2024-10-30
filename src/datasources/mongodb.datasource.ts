import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = (origin: string) => origin === process.env.PRODUCCION_URL;

// Función para construir la URL de la base de datos según el origen
const dataBase = (origin: string): string => {
  const dbName = isProduction(origin)
    ? process.env.DB_NAME_PROD
    : process.env.DB_NAME_DEMO;

  return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${dbName}?${process.env.DB_OPTIONS}`;
};

const config = {
  name: process.env.NAME ?? 'mongodb',
  connector: process.env.CONNECTOR ?? 'mongodb',
  url: dataBase(process.env.ORIGIN ?? ''),
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
