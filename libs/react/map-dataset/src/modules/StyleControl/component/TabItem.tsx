import { BaseButton } from '@hungpvq/react-map-core';
import type { ComponentType } from 'react';
import type { Tab } from '@hungpvq/map-dataset';
import { resolveTabProps } from '../style/type/tab-utils';

function resolveComponent(
  factory: unknown,
): ComponentType<Record<string, unknown>> | undefined {
  if (typeof factory !== 'function') return undefined;
  return (factory as () => ComponentType<Record<string, unknown>>)();
}

export function TabItem({
  value,
  text,
  item,
  default_value,
  disabled,
  active,
}: {
  value?: unknown;
  text?: unknown;
  item: Tab;
  default_value?: unknown;
  disabled?: boolean;
  active?: boolean;
}) {
  const Label = resolveComponent(item.component?.label);
  const labelProps = resolveTabProps(item.props?.label, item);
  const defaultShowInItem =
    value != null && value !== ''
      ? value
      : default_value != null && default_value !== ''
        ? default_value
        : 'None';

  return (
    <BaseButton
      className={`tab-item${active ? ' tab-item-active' : ''}${
        disabled ? ' tab-item-disabled' : ''
      }`}
      disabled={disabled}
    >
      <div className="tab-item-title" title={String(text ?? '')}>
        {String(text ?? '')}
      </div>
      <div className="tab-item-sub-title" title={String(defaultShowInItem)}>
        {Label ? (
          <Label
            {...labelProps}
            tab={item}
            value={value}
            default_value={default_value}
          />
        ) : (
          <p>{String(defaultShowInItem)}</p>
        )}
      </div>
    </BaseButton>
  );
}
