import { installDevtoolsCore } from '@hungpvq/map-core/devtools';
import { devtoolLogAdapter } from './store';

let uninstallGlobalErrors: (() => void) | undefined;

export function installDevtools() {
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = installDevtoolsCore(devtoolLogAdapter);
}

export function uninstallDevtools() {
  uninstallGlobalErrors?.();
  uninstallGlobalErrors = undefined;
}
