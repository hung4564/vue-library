export function assertDefined<T>(val: T | undefined | null, msg: string): T {
  if (val === undefined || val === null) throw new Error(msg);
  return val;
}
