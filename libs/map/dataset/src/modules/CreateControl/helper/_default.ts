import type { IDataset } from '../../../interfaces';

export abstract class ConfigHelper<F = Record<string, unknown>> {
  abstract get default_value(): Omit<F, 'name'>;

  validate(form: F & { name?: string }): boolean {
    if (!form.name) {
      return false;
    }
    return true;
  }

  abstract get create(): (form: F & { name: string }) => IDataset;

  get component(): (() => any) | undefined {
    return undefined;
  }
}
