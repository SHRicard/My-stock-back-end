import * as dotenv from 'dotenv';
import {ApplicationConfig, MyBackendStockApplication} from './application';
export * from './application';

dotenv.config();
export async function main(options: ApplicationConfig = {}) {
  const app = new MyBackendStockApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST ?? process.env.DEFAULT_HOST;
const ORIGIN = process.env.ORIGIN ?? '*';
const METHODS = process.env.METHODS ?? 'GET,HEAD,PUT,PATCH,POST,DELETE';

if (require.main === module) {
  const config = {
    rest: {
      port: PORT,
      host: HOST,
      gracePeriodForClose: 5000,
      openApiSpec: {
        setServersFromRequest: false,
      },
      cors: {
        origin: ORIGIN,
        methods: METHODS,
        preflightContinue: false,
        optionsSuccessStatus: 204,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
