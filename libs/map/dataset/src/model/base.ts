import { getUUIDv4 } from '@hungpvq/shared';

export class Base {
  private _id: string;
  get id() {
    return this._id;
  }
  constructor() {
    this._id = `${getUUIDv4()}`;
  }
}
