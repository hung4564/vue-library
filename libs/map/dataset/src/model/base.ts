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

type PrototypeSource = string | Function;
export function createNamedComponent<T extends object>(
  prototypeSource: PrototypeSource,
  data: T,
): T {
  try {
    let prototypeFn: Function;

    if (typeof prototypeSource === 'string') {
      prototypeFn = new Function(`return function ${prototypeSource}() {}`)();
    } else if (typeof prototypeSource === 'function') {
      prototypeFn = prototypeSource;
    } else {
      throw new Error('Invalid prototype source');
    }

    const obj = Object.create(prototypeFn.prototype);
    return Object.assign(obj, data);
  } catch {
    // fallback nếu bị CSP hoặc lỗi syntax
    return { ...data };
  }
}
