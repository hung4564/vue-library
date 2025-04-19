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
export function createBase() {
  const _id = getUUIDv4();

  return {
    get id() {
      return _id;
    },
  };
}
