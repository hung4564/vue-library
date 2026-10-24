import type { ReactNode } from 'react';

import { BaseButton } from './BaseButton';

export type TabItem = {
  id: string;
  label: string;
};

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  withPanes?: boolean;
  panes?: Record<string, ReactNode>;
}

export function Tabs({
  items,
  value,
  onChange,
  withPanes = true,
  panes,
}: TabsProps) {
  const activeId = items.some((item) => item.id === value)
    ? value
    : (items[0]?.id ?? '');
  const hasPanes =
    withPanes && items.some((item) => panes?.[item.id] != null);

  return (
    <div
      className={`ui-tabs-root${hasPanes ? '' : ' ui-tabs-root--bar-only'}`}
    >
      <div
        className="ui-tabs"
        role="tablist"
      >
        {items.map((item) => (
          <BaseButton
            key={item.id}
            role="tab"
            aria-selected={activeId === item.id}
            variant="text"
            active={activeId === item.id}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </BaseButton>
        ))}
      </div>
      {hasPanes ? (
        <div className="ui-tabs__panes">
          {items.map((item) => (
            <div
              key={item.id}
              className="ui-tabs__pane"
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
