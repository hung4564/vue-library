import type { IDataset } from '@hungpvq/map-dataset';

export abstract class ConfigHelper<F = Record<string, unknown>> {
  abstract get default_value(): Omit<F, 'name'>;
  abstract get create(): (form: F & { name: string }) => IDataset | Promise<IDataset>;
  get componentKey(): string | undefined {
    return undefined;
  }

  /** Locale keys under `map.layer-control.create.*` for failed checks. */
  validationErrors(form: F & { name?: string }): string[] {
    const errors: string[] = [];
    if (!form.name) errors.push('validation-name');
    return errors;
  }

  validate(form: F & { name?: string }): boolean {
    return this.validationErrors(form).length === 0;
  }
}
