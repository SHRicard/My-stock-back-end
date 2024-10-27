import {Entity, model, property} from '@loopback/repository';
import {Profile} from './Profile';

@model({settings: {strict: true}})
export class WorkRecord extends Entity {
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
  userId: string;
  @property({
    type: 'object',
    required: true,
    itemType: Profile,
  })
  profile: Profile;

  @property({
    type: 'date',
    required: true,
  })
  workDate: Date;

  @property({
    type: 'date',
    required: true,
  })
  startTime: Date;

  @property({
    type: 'date',
  })
  endTime?: Date;

  @property({
    type: 'string',
  })
  totalHours?: string;

  @property({
    type: 'array',
    itemType: 'object',
  })
  description?: {
    date: Date;
    details: string;
  }[];

  @property({
    type: 'string',
    default: 'activo',
  })
  status: string;

  constructor(data?: Partial<WorkRecord>) {
    super(data);
  }
}

export interface WorkRecordRelations {}

export type WorkRecordWithRelations = WorkRecord & WorkRecordRelations;
