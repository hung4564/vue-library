import {
  computed,
  ComputedGetter,
  reactive,
  ToRefs,
  toRefs,
  watchEffect,
} from 'vue';

// Only allow a single return type
type NotAUnion<T> = [T] extends [infer U] ? _NotAUnion<U, U> : never;
type _NotAUnion<T, U> = U extends any
  ? [T] extends [U]
    ? unknown
    : never
  : never;

export function toKebabCase(str = '') {
  if (toKebabCase.cache.has(str)) return toKebabCase.cache.get(str)!;
  const kebab = str
    .replace(/[^a-z]/gi, '-')
    .replace(/\B([A-Z])/g, '-$1')
    .toLowerCase();
  toKebabCase.cache.set(str, kebab);
  return kebab;
}
toKebabCase.cache = new Map<string, string>();

export function padEnd(str: string, length: number, char = '0') {
  return str + char.repeat(Math.max(0, length - str.length));
}

export function padStart(str: string, length: number, char = '0') {
  return char.repeat(Math.max(0, length - str.length)) + str;
}

export function chunk(str: string, size = 1) {
  const chunked: string[] = [];
  let index = 0;
  while (index < str.length) {
    chunked.push(str.substr(index, size));
    index += size;
  }
  return chunked;
}

export function has<T extends string>(
  obj: object,
  key: T[]
): obj is Record<T, unknown> {
  return key.every((k) => Object.prototype.hasOwnProperty.call(obj, k));
}

/**
 * Convert a computed ref to a record of refs.
 * The getter function must always return an object with the same keys.
 */
export function destructComputed<T extends object>(
  getter: ComputedGetter<T & NotAUnion<T>>
): ToRefs<T>;
export function destructComputed<T extends object>(getter: ComputedGetter<T>) {
  const refs = reactive({}) as T;
  const base = computed(getter);
  watchEffect(
    () => {
      for (const key in base.value) {
        refs[key] = base.value[key];
      }
    },
    { flush: 'sync' }
  );
  return toRefs(refs);
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

type MaybePick<T extends object, U extends Extract<keyof T, string>> = Record<
  string,
  unknown
> extends T
  ? Partial<Pick<T, U>>
  : Pick<T, U>;
// Array of keys
export function pick<T extends object, U extends Extract<keyof T, string>>(
  obj: T,
  paths: U[]
): MaybePick<T, U> {
  const found: any = {};

  const keys = new Set(Object.keys(obj));
  for (const path of paths) {
    if (keys.has(path)) {
      found[path] = obj[path];
    }
  }

  return found;
}

export function mergeDeep(
  source: Record<string, any> = {},
  target: Record<string, any> = {},
  arrayFn?: (a: unknown[], b: unknown[]) => unknown[]
) {
  const out: Record<string, any> = {};

  for (const key in source) {
    out[key] = source[key];
  }

  for (const key in target) {
    const sourceProperty = source[key];
    const targetProperty = target[key];

    // Only continue deep merging if
    // both properties are objects
    if (isObject(sourceProperty) && isObject(targetProperty)) {
      out[key] = mergeDeep(sourceProperty, targetProperty, arrayFn);

      continue;
    }

    if (
      Array.isArray(sourceProperty) &&
      Array.isArray(targetProperty) &&
      arrayFn
    ) {
      out[key] = arrayFn(sourceProperty, targetProperty);

      continue;
    }

    out[key] = targetProperty;
  }

  return out;
}

export function isObject(obj: any): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

/** Array.includes but value can be any type */
export function includes(arr: readonly any[], val: any) {
  return arr.includes(val);
}

export function convertToUnit(str: number, unit?: string): string;
export function convertToUnit(
  str: string | number | null | undefined,
  unit?: string
): string | undefined;
export function convertToUnit(
  str: string | number | null | undefined,
  unit = 'px'
): string | undefined {
  if (str == null || str === '') {
    return undefined;
  } else if (isNaN(+str!)) {
    return String(str);
  } else if (!isFinite(+str!)) {
    return undefined;
  } else {
    return `${Number(str)}${unit}`;
  }
}
