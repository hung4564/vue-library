import type { Position } from '@hungpvq/map-core';
import type { MapControlButtonUIState } from '@hungpvq/map-core/toolbar';
import React, { useMemo } from 'react';

import { MapCommonButton } from './MapCommonButton';
import { MapControlGroupButton } from './MapControlGroupButton';

export type MapAutoHostButtonsProps = {
  state: unknown;
  position?: Position | string;
  onAction: (...args: unknown[]) => void;
};

function isButtonRecord(
  value: unknown,
): value is Record<string, MapControlButtonUIState> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const vals = Object.values(value as Record<string, unknown>);
  if (vals.length === 0) return false;
  return vals.every(
    (v) => v != null && typeof v === 'object' && !Array.isArray(v),
  );
}

export function MapAutoHostButtons({
  state,
  position,
  onAction,
}: MapAutoHostButtonsProps) {
  const mode = useMemo(() => {
    if (!state) return 'empty' as const;
    if (!isButtonRecord(state)) return 'single' as const;
    return 'launcher' in state ? ('expandable' as const) : ('module' as const);
  }, [state]);

  const record = isButtonRecord(state) ? state : undefined;
  const launcher = record?.launcher;
  const moduleEntries = record ? Object.entries(record) : [];
  const optionEntries = record
    ? Object.entries(record).filter(
        ([id, btn]) => id !== 'launcher' && btn?.role === 'option',
      )
    : [];

  const expandRight = String(position ?? '').endsWith('left');
  const sample = launcher ?? (record ? Object.values(record)[0] : undefined);
  const row = sample?.orientation === 'row';

  if (mode === 'single' && state) {
    return (
      <MapCommonButton
        option={state as MapControlButtonUIState}
        onClick={(e) => {
          e.stopPropagation();
          onAction(e.nativeEvent);
        }}
      />
    );
  }

  if (mode === 'module') {
    return (
      <MapControlGroupButton row={row}>
        {moduleEntries.map(([id, btn]) =>
          btn && btn.visible !== false ? (
            <MapCommonButton
              key={id}
              option={btn}
              onClick={(e) => {
                e.stopPropagation();
                onAction(id, e.nativeEvent);
              }}
            />
          ) : null,
        )}
      </MapControlGroupButton>
    );
  }

  if (mode === 'expandable' && launcher) {
    const launcherBtn =
      launcher.visible !== false ? (
        <MapCommonButton
          key="launcher"
          option={launcher}
          onClick={(e) => {
            e.stopPropagation();
            onAction('launcher', e.nativeEvent);
          }}
        />
      ) : null;

    const optionBtns = launcher.active
      ? optionEntries.map(([id, btn]) =>
          btn && btn.visible !== false ? (
            <MapCommonButton
              key={id}
              option={btn}
              onClick={(e) => {
                e.stopPropagation();
                onAction(id, e.nativeEvent);
              }}
            />
          ) : null,
        )
      : null;

    return (
      <MapControlGroupButton row={row} className="map-host-expandable">
        {expandRight ? (
          <>
            {launcherBtn}
            {optionBtns}
          </>
        ) : (
          <>
            {optionBtns}
            {launcherBtn}
          </>
        )}
      </MapControlGroupButton>
    );
  }

  return null;
}
