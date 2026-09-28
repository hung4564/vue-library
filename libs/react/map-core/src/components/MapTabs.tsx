import React, { type ReactNode, useMemo } from 'react';

import { MapControlButton } from './MapControlButton';

export type MapTabItem = {
  id: string;
  label: string;
};

export type MapTabsProps = {
  items: MapTabItem[];
  value: string;
  onChange: (id: string) => void;
  /** When false, render only the tab bar (no pane host). */
  withPanes?: boolean;
  /** Pane content keyed by tab id. Omitted ids simply hide. */
  panes?: Record<string, ReactNode>;
  className?: string;
};

export function MapTabs({
  items,
  value,
  onChange,
  withPanes = true,
  panes,
  className,
}: MapTabsProps) {
  const activeId = useMemo(() => {
    if (items.some((item) => item.id === value)) return value;
    return items[0]?.id ?? '';
  }, [items, value]);

  const hasPanes =
    withPanes && !!panes && items.some((item) => panes[item.id] != null);

  return (
    <div
      className={[
        'map-tabs-root',
        !hasPanes ? 'map-tabs-root--bar-only' : '',
        className || '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="map-tabs"
        role="tablist"
      >
        {items.map((item) => (
          <MapControlButton
            key={item.id}
            role="tab"
            aria-selected={activeId === item.id}
            variant="text"
            size="small"
            active={activeId === item.id}
            onClick={() => {
              if (item.id !== value) onChange(item.id);
            }}
          >
            {item.label}
          </MapControlButton>
        ))}
      </div>
      {hasPanes ? (
        <div className="map-tabs__panes">
          {items.map((item) => (
            <div
              key={item.id}
              className="map-tabs__pane"
              role="tabpanel"
              hidden={activeId !== item.id}
            >
              {panes?.[item.id]}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
