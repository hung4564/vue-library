import { useEffect, useMemo, useRef, useState } from 'react';

import { type Position, type WithMapPropType } from '@hungpvq/map-core';
import {
  type AnyToolbarOptions,
  type AnyToolbarStrategy,
  type ControlStrategy,
  type MapControlButtonState,
  type MapControlButtonUIState,
  type Toolbar,
  type ToolbarKind,
  createLiveToolbarStrategy,
} from '@hungpvq/map-core/toolbar';

import { useResolvedControlLayout } from '../../hooks/useMap';
import { useLang } from '../lang/hook';
import { useMapToolbarModule } from './store';

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
    createLiveToolbarStrategy(() => optionsRef.current, toolbar, kind),
  );

  const { state } = useInitToolbarControl(control, controlLayout);

  const { language } = useLang(mapId);
  useEffect(() => {
    control.sync();
  }, [language, control]);

  return { state, control };
}
