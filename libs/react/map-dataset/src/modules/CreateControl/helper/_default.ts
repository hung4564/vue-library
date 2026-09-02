import type { IDataset } from '@hungpvq/map-dataset';

export abstract class ConfigHelper<F = Record<string, unknown>> {
  abstract get default_value(): Omit<F, 'name'>;
  abstract get create(): (form: F & { name: string }) => IDataset | Promise<IDataset>;
  get componentKey(): string | undefined {
    return undefined;
  }

  validate(form: F & { name?: string }): boolean {
    return !!form.name;
  }
}
