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
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const ORIGIN = process.env.ORIGIN;
const METHODS = process.env.METHODS;

if (require.main === module) {
  const config = {
    rest: {
      port: PORT,
      host: HOST,
      gracePeriodForClose: 5000,
      openApiSpec: {
        setServersFromRequest: true,
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
