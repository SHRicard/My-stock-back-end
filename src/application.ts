import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, RestBindings} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MongodbDataSource} from './datasources';
import {AuthMiddleware} from './Middleware/auth.middleware';
import {MySequence} from './sequence';
import {GlobalLogService} from './services/global-log.service';
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

    this.bind(RestBindings.PORT).to(parseInt(process.env.PORT ?? '3000', 10));
    this.bind(RestBindings.HOST).to(process.env.HOST ?? '0.0.0.0');

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
