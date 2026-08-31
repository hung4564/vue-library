import { useEffect, useRef, useState, type MutableRefObject } from 'react';

import {
  type AnyToolbarOptions,
  type AnyToolbarStrategy,
  type ControlStrategy,
  type MapControlButtonUIState,
  type ToolbarButtonConfig,
  type ToolbarKind,
  type ToolbarModuleOptions,
  type ToolbarSingleOptions,
  createToolbarStrategy,
  type WithMapPropType,
} from '@hungpvq/map-core';

import { useMapToolbarModule } from './store';

export {
  createSubscribable,
  createToolbarControl,
  createToolbarModule,
} from '@hungpvq/map-core';
export type { ToolbarButtonConfig } from '@hungpvq/map-core';

export function useInitToolbarControl<T extends AnyToolbarStrategy>(control: T) {
  type StateType = T extends ControlStrategy
    ? MapControlButtonUIState
    : Record<string, MapControlButtonUIState>;

  const [state, setState] = useState<StateType>();

  useEffect(() => {
    const unsubscribe = control.subscribe((s) => {
      setState(s as StateType);
    });
    control.mount();
    return () => {
      unsubscribe?.();
      control.unmount();
    };
  }, [control]);

  return { state };
}

type ToolbarSingleOptionsControl = Pick<
  WithMapPropType,
  'controlLayout' | 'controlOrder'
>;

function createLiveToolbarStrategy(
  optionsRef: MutableRefObject<AnyToolbarOptions>,
  toolbar: ReturnType<typeof useMapToolbarModule>,
  kind: ToolbarKind,
): AnyToolbarStrategy {
  if (kind === 'module') {
    const initial = optionsRef.current as ToolbarModuleOptions;

    const buttons: ToolbarButtonConfig[] = initial.buttons.map((btn) => ({
      id: btn.id,
      get order() {
        const current = optionsRef.current as ToolbarModuleOptions;
        const live = current.buttons.find((b) => b.id === btn.id);
        return (live ?? btn).order;
      },
      getState: () => {
        const current = optionsRef.current as ToolbarModuleOptions;
        const live = current.buttons.find((b) => b.id === btn.id);
        return (live ?? btn).getState();
      },
      onClick: async (e: MouseEvent) => {
        const current = optionsRef.current as ToolbarModuleOptions;
        const live = current.buttons.find((b) => b.id === btn.id);
        await (live ?? btn).onClick?.(e);
      },
    }));

    return createToolbarStrategy({
      kind: 'module',
      get moduleId() {
        return (optionsRef.current as ToolbarModuleOptions).moduleId;
      },
      get moduleOrder() {
        return (optionsRef.current as ToolbarModuleOptions).moduleOrder;
      },
      toolbar,
      buttons,
    });
  }

  return createToolbarStrategy({
    kind: 'single',
    id: (optionsRef.current as ToolbarSingleOptions).id,
    toolbar,
    getState: () => (optionsRef.current as ToolbarSingleOptions).getState(),
    onClick: (e: MouseEvent) =>
      (optionsRef.current as ToolbarSingleOptions).onClick?.(e),
  });
}

export function useToolbarControl(
  mapId: string,
  opts: ToolbarSingleOptionsControl,
  options: AnyToolbarOptions,
): {
  control: AnyToolbarStrategy;
  state:
    | MapControlButtonUIState
    | Record<string, MapControlButtonUIState>
    | undefined;
} {
  const toolbar = useMapToolbarModule(
    mapId,
    opts.controlLayout ?? 'standalone',
  );

  const kind: ToolbarKind = (options.kind ?? 'single') as ToolbarKind;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [control] = useState(() =>
    createLiveToolbarStrategy(optionsRef, toolbar, kind),
  );

  const { state } = useInitToolbarControl(control);

  return { state, control };
}
