import {Entity, model, property} from '@loopback/repository';

@model()
export class GlobalLog extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  module: string;

  @property({
    type: 'string',
    required: true,
  })
  operation: string;

  @property({
    type: 'string',
    required: true,
  })
  entityId: string;

  @property({
    type: 'object',
    required: false,
    jsonSchema: {
      properties: {
        message: {type: 'string'},
        data: {
          type: ['object', 'array', 'string', 'number', 'boolean', 'null'],
          additionalProperties: true,
        },
      },
      required: ['message', 'data'],
    },
  })
  changes: {
    message: string;
    data: string | number;
  };

  @property({
    type: 'date',
    required: true,
  })
  date: string;

  @property({
    type: 'string',
  })
  userId?: string;

  @property({
    type: 'string',
  })
  nameUser?: string;

  constructor(data?: Partial<GlobalLog>) {
    super(data);
  }
}

export interface GlobalLogRelations {}

export type GlobalLogWithRelations = GlobalLog & GlobalLogRelations;
