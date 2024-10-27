// import {/* inject, */ BindingScope, injectable} from '@loopback/core';
// import {repository} from '@loopback/repository';
// import {GlobalLog} from '../models';
// import {GlobalLogRepository} from '../repositories';

// @injectable({scope: BindingScope.TRANSIENT})
// export class GlobalLogService {
//   constructor(
//     @repository(GlobalLogRepository)
//     public globalLogRepository: GlobalLogRepository,
//   ) {}

//   // Método para crear una entrada en el log
//   async createLogEntry(logData: Omit<GlobalLog, 'id'>): Promise<GlobalLog> {
//     return this.globalLogRepository.create(logData);
//   }
// }
import {BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {GlobalLog} from '../models';
import {GlobalLogRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class GlobalLogService {
  constructor(
    @repository(GlobalLogRepository)
    public globalLogRepository: GlobalLogRepository,
    @inject('currentUser') private currentUser: any, // Inyectar el usuario autenticado
  ) {}

  // Método para crear una entrada en el log
  async createLogEntry(logData: Omit<GlobalLog, 'id'>): Promise<GlobalLog> {
    // Añadir automáticamente el userId del usuario autenticado al log
    const logEntry = {
      ...logData,
      userId: this.currentUser?.id || 'unknown', // Asigna el ID del usuario autenticado
      nameUser: this.currentUser?.name || 'unknown',
      date: new Date().toISOString(), // Añadir la fecha actual
    };

    return this.globalLogRepository.create(logEntry);
  }
}
