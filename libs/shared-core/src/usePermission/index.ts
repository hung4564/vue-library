import { createSingletonPromise } from '@hungpv97/shared';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { ConfigurableNavigator } from '../_configurable';
import { defaultNavigator } from '../_configurable';
import { useEventListener } from '../useEventListener';
import { useSupported } from '../useSupported';

type DescriptorNamePolyfill =
  | 'accelerometer'
  | 'accessibility-events'
  | 'ambient-light-sensor'
  | 'background-sync'
  | 'camera'
  | 'clipboard-read'
  | 'clipboard-write'
  | 'gyroscope'
  | 'magnetometer'
  | 'microphone'
  | 'notifications'
  | 'payment-handler'
  | 'persistent-storage'
  | 'push'
  | 'speaker';

export type GeneralPermissionDescriptor =
  | PermissionDescriptor
  | { name: DescriptorNamePolyfill };

export interface UsePermissionOptions<Controls extends boolean>
  extends ConfigurableNavigator {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls;
}

export type UsePermissionReturn = Readonly<Ref<PermissionState | undefined>>;
export interface UsePermissionReturnWithControls {
  state: UsePermissionReturn;
  isSupported: Ref<boolean>;
  query: () => Promise<PermissionStatus | undefined>;
}

export function usePermission(
  permissionDesc:
    | GeneralPermissionDescriptor
    | GeneralPermissionDescriptor['name'],
  options?: UsePermissionOptions<false>
): UsePermissionReturn;
export function usePermission(
  permissionDesc:
    | GeneralPermissionDescriptor
    | GeneralPermissionDescriptor['name'],
  options: UsePermissionOptions<true>
): UsePermissionReturnWithControls;
export function usePermission(
  permissionDesc:
    | GeneralPermissionDescriptor
    | GeneralPermissionDescriptor['name'],
  options: UsePermissionOptions<boolean> = {}
): UsePermissionReturn | UsePermissionReturnWithControls {
  const { controls = false, navigator = defaultNavigator } = options;

  const isSupported = useSupported(
    () => navigator && 'permissions' in navigator
  );
  let permissionStatus: PermissionStatus | undefined;

  const desc =
    typeof permissionDesc === 'string'
      ? ({ name: permissionDesc } as PermissionDescriptor)
      : (permissionDesc as PermissionDescriptor);
  const state = ref<PermissionState | undefined>();

  const onChange = () => {
    if (permissionStatus) state.value = permissionStatus.state;
  };

  const query = createSingletonPromise(async () => {
    if (!isSupported.value) return;
    if (!permissionStatus) {
      try {
        permissionStatus = await navigator!.permissions.query(desc);
        useEventListener(permissionStatus, 'change', onChange);
        onChange();
      } catch {
        state.value = 'prompt';
      }
    }
    return permissionStatus;
  });

  query();

  if (controls) {
    return {
      state: state as UsePermissionReturn,
      isSupported,
      query,
    };
  } else {
    return state as UsePermissionReturn;
  }
}
