import type { IDataset } from '@hungpvq/map-dataset';

export abstract class ConfigHelper<F = Record<string, unknown>> {
  abstract get default_value(): Omit<F, 'name'>;

  validate(form: F & { name?: string }): boolean {
    if (!form.name) {
      return false;
    }
    return true;
  }

  abstract get create(): (form: F & { name: string }) => IDataset | Promise<IDataset>;

  get component(): (() => any) | undefined {
    return undefined;
  }

  get dataSourceComponent(): (() => any) | undefined {
    return this.component;
  }

  get settingsComponent(): (() => any) | undefined {
    return undefined;
  }

  get hasLayerSettings(): boolean {
    return this.settingsComponent !== undefined;
  }
}
