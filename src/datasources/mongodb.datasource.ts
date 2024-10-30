import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  name: process.env.NAME ?? 'mongodb',
  connector: process.env.CONNECTOR ?? 'mongodb',
  url: '', // La URL será proporcionada por el DatabaseUrlProvider
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

    // Inyecta la URL proporcionada por DatabaseUrlProvider
    @inject('datasources.config.mongodb.url') databaseUrl: string,
  ) {
    super({...dsConfig, url: databaseUrl}); // Usa la URL proporcionada por el Provider
  }
}
