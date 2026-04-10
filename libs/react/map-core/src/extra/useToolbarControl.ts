/**
 * Placeholder for useToolbarControl hook
 * Full implementation would be in extra/toolbar (not migrated yet)
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  WithMapPropType,
  MapControlButtonUIState,
} from '@hungpvq/map-core';

interface ToolbarControlConfig {
  id?: string;
  kind?: string;
  moduleId?: string;
  moduleOrder?: number;
  getState?: () => MapControlButtonUIState;
  buttons?: Array<{
    id: string;
    getState: () => MapControlButtonUIState;
    onClick?: (e?: React.MouseEvent) => void | Promise<void>;
  }>;
  onClick?: (e?: React.MouseEvent) => void | Promise<void>;
}

export function useToolbarControl(
  mapId: string,
  props: WithMapPropType,
  config: ToolbarControlConfig,
) {
  const [state, setState] = useState<MapControlButtonUIState | any>(null);

  const sync = useCallback(() => {
    if (config.getState) {
      const newState = config.getState();
      setState(newState);
    } else if (config.buttons) {
      const buttons = config.buttons.map((btn) => btn.getState());
      setState({ buttons });
    }
  }, [config]);

  useEffect(() => {
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only sync once on mount, not on every config change

  const onAction = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (config.onClick) {
        await config.onClick(e);
      }
      sync();
    },
    [config, sync],
  );

  const control = {
    sync,
    onAction,
  };

  return { state, control };
}
