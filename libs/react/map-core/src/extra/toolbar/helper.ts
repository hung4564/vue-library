import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';

import { type Position, type WithMapPropType } from '@hungpvq/map-core';
import {
  type AnyToolbarOptions,
  type AnyToolbarStrategy,
  type ControlStrategy,
  type MapControlButtonState,
  type MapControlButtonUIState,
  type Toolbar,
  type ToolbarButtonConfig,
  type ToolbarKind,
  type ToolbarModuleOptions,
  type ToolbarSingleOptions,
  createToolbarStrategy,
} from '@hungpvq/map-core/toolbar';

import { useResolvedControlLayout } from '../../hooks/useMap';
import { useMapToolbarModule } from './store';

export type { ToolbarButtonConfig } from '@hungpvq/map-core/toolbar';

export function useInitToolbarControl<T extends AnyToolbarStrategy>(
  control: T,
  layoutKey?: string,
) {
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
  }, [control, layoutKey]);

  return { state };
}

type ToolbarSingleOptionsControl = Pick<
  WithMapPropType,
  'controlLayout' | 'controlOrder' | 'position'
>;

function createLiveToolbarStrategy(
  optionsRef: MutableRefObject<AnyToolbarOptions>,
  toolbar: Toolbar,
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
      get order() {
        return (optionsRef.current as ToolbarModuleOptions).order;
      },
      get orientation() {
        return (optionsRef.current as ToolbarModuleOptions).orientation;
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
  const controlLayout = useResolvedControlLayout(opts.controlLayout);
  const layoutRef = useRef(controlLayout);
  layoutRef.current = controlLayout;
  const toolbarBase = useMapToolbarModule(mapId, () => layoutRef.current);

  const positionRef = useRef<Position>(
    (opts.position || 'bottom-right') as Position,
  );
  positionRef.current = (opts.position || 'bottom-right') as Position;

  const toolbar = useMemo<Toolbar>(
    () => ({
      register(state: MapControlButtonState) {
        toolbarBase.register({
          ...state,
          position: positionRef.current,
        });
      },
      update(id, patch) {
        toolbarBase.update(id, {
          ...patch,
          position: positionRef.current,
        });
      },
      unregister(id) {
        toolbarBase.unregister(id);
      },
    }),
    [toolbarBase],
  );

  const kind: ToolbarKind = (options.kind ?? 'single') as ToolbarKind;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [control] = useState(() =>
    createLiveToolbarStrategy(optionsRef, toolbar, kind),
  );

  const { state } = useInitToolbarControl(control, controlLayout);

  return { state, control };
}
