import {Provider} from '@loopback/core';
import * as dotenv from 'dotenv';

dotenv.config();

export class DatabaseUrlProvider implements Provider<string> {
  value(): string {
    // Verifica el entorno actual
    const isProduction = process.env.NODE_ENV === 'production';
    // Selecciona la base de datos en función del entorno
    const dbName = isProduction
      ? process.env.DB_NAME_PROD
      : process.env.DB_NAME_DEMO;

    // Retorna la URL de conexión de MongoDB
    return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${dbName}?${process.env.DB_OPTIONS}`;
  }
}
