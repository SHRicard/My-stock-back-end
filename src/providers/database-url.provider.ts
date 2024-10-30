import {Provider, inject} from '@loopback/core';
import {HttpErrors, RequestContext} from '@loopback/rest';
import * as dotenv from 'dotenv';

dotenv.config();

export class DatabaseUrlProvider implements Provider<string> {
  constructor(@inject.context() private ctx: RequestContext) {}

  value(): string {
    const origin = this.ctx.request.headers.origin;
    if (!origin) {
      throw new HttpErrors.BadRequest('Origin header is missing');
    }

    // Decide la base de datos en función de la URL de origen
    const isDemo = origin === process.env.DEMO_URL;
    const dbName = isDemo ? process.env.DB_NAME_DEMO : process.env.DB_NAME_PROD;

    // Retorna la URL de conexión de MongoDB
    return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${dbName}?${process.env.DB_OPTIONS}`;
  }
}
