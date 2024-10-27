import {Entity, model, property} from '@loopback/repository';

@model()
export class AdminUser extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  username: string;
  @property({
    type: 'string',
    required: true,
  })
  name: string;
  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

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
  role: string;

  constructor(data?: Partial<AdminUser>) {
    super(data);
  }
}

export interface AdminUserRelations {}

export type AdminUserWithRelations = AdminUser & AdminUserRelations;
