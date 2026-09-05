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

type PrototypeSource = string | any;

export function createNamedComponent<T extends object>(
  prototypeSource: PrototypeSource,
  data: T,
): T {
  let prototypeFn: any;

  if (typeof prototypeSource === 'function') {
    prototypeFn = prototypeSource;
  } else {
    // Fallback for string source - avoid new Function for CSP compliance
    prototypeFn = class Component {};
    if (typeof prototypeSource === 'string') {
      Object.defineProperty(prototypeFn, 'name', { value: prototypeSource });
    }
  }

  const obj = Object.create(prototypeFn.prototype);
  // Shallow copy only — do not wrap with logging Proxies (circular graphs
  // caused Maximum call stack size exceeded while creating layers).
  return Object.assign(obj, { ...data });
}
