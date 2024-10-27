import {Model, property} from '@loopback/repository';

export class Profile extends Model {
  @property({
    type: 'string',
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  surName: string;

  @property({
    type: 'string',
    required: true,
  })
  documents: string;
}
