import { installDevtoolsCore } from '@hungpvq/map-core/devtools';
import { devtoolLogAdapter } from './store';

let uninstallGlobalErrors: (() => void) | undefined;

/**
 * Bootstrap map devtools (log adapter + global error capture).
 * Same contract as `@hungpvq/react-map-devtools` `installDevtools`.
 * Mount `<Devtools />` explicitly (import from this package).
 */
export function installDevtools() {
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = installDevtoolsCore(devtoolLogAdapter);
}

export function uninstallDevtools() {
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = undefined;
}
