import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, RestBindings} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import {MongodbDataSource} from './datasources';
import {AuthMiddleware} from './Middleware/auth.middleware';
import {MySequence} from './sequence';
import {GlobalLogService} from './services/global-log.service';

dotenv.config();

export {ApplicationConfig};

export class MyBackendStockApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.sequence(MySequence);

    this.static('/', path.join(__dirname, '../public'));

    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.service(GlobalLogService);
    this.dataSource(MongodbDataSource);
    this.middleware(AuthMiddleware);

    // Configuración del puerto y host desde variables de entorno
    this.bind(RestBindings.PORT).to(parseInt(process.env.PORT ?? '3000', 10));
    this.bind(RestBindings.HOST).to(process.env.HOST ?? '0.0.0.0');

    // Configuración de CORS
    this.bind('middleware.CORS').to(
      cors({
        origin: process.env.ORIGIN,
        methods: process.env.METHODS,
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      }),
    );

    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js', '.controller.ts'],
        nested: true,
      },
    };
  }
}
