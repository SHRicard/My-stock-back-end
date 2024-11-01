// import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
// import {juggler} from '@loopback/repository';

// // const config = {
// //   name: 'mongodb',
// //   connector: 'mongodb',
// //   url: 'mongodb+srv://rricardo:Miloana442114523@cluster0.td5ha.mongodb.net/Stock?retryWrites=true&w=majority&appName=Cluster',
// //   useNewUrlParser: true,
// // };

// const config = {
//   name: 'mongodb',
//   connector: 'mongodb',
//   url: 'mongodb+srv://rricardo:Miloana442114523@cluster0.td5ha.mongodb.net/Stock?retryWrites=true&w=majority',
//   useNewUrlParser: true,
// };

// @lifeCycleObserver('datasource')
// export class MongodbDataSource
//   extends juggler.DataSource
//   implements LifeCycleObserver
// {
//   static dataSourceName = 'mongodb';
//   static readonly defaultConfig = config;

//   constructor(
//     @inject('datasources.config.mongodb', {optional: true})
//     dsConfig: object = config,
//   ) {
//     super(dsConfig);
//   }
// }
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  name: process.env.NAME ?? 'mongodb',
  connector: process.env.CONNECTOR ?? 'mongodb',
  url: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`,
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
