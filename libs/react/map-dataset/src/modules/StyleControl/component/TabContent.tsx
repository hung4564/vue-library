import { copyByJson } from '@hungpvq/shared';
import { BaseButton } from '@hungpvq/react-map-core';
import type { ComponentType } from 'react';
import type { Tab } from '@hungpvq/map-dataset';
import type { TransFn } from '../style/type/tab-utils';
import { resolveTabProps, toReactFieldProps } from '../style/type/tab-utils';

function resolveComponent(
  factory: unknown,
): ComponentType<Record<string, unknown>> | undefined {
  if (typeof factory !== 'function') return undefined;
  return (factory as () => ComponentType<Record<string, unknown>>)();
}

function toFieldValue(item: Tab, form: unknown) {
  if (item.type === 'opacity' || item.type === 'minMax') {
    return form == null || form === '' ? 0 : Number(form);
  }
  if (typeof form === 'number' || typeof form === 'boolean') {
    return String(form);
  }
  return form;
}

export function TabContent({
  value,
  item,
  default_value,
  trans,
  mapId,
  onInput,
}: {
  value?: unknown;
  item: Tab;
  default_value?: unknown;
  trans: TransFn;
  mapId: string;
  onInput: (value: unknown) => void;
}) {
  const form =
    value != null
      ? value
      : default_value != null
        ? copyByJson(default_value)
        : undefined;
  const Field = resolveComponent(item.component?.content);
  const extra = toReactFieldProps(resolveTabProps(item.props?.content, item));

  function onSetDefaultValue() {
    onInput(default_value != null ? copyByJson(default_value) : undefined);
  }

  const display =
    value != null && value !== ''
      ? value
      : default_value != null
        ? default_value
        : '';

  return (
    <div className="tab-item">
      {Field ? (
        <Field
          {...extra}
          mapId={mapId}
          className={`tab-item-content ${extra.className || ''}`.trim()}
          value={toFieldValue(item, form)}
          checked={!!form}
          onChange={onInput}
        />
      ) : (
        <div className="tab-item-content">
          <p>{String(display)}</p>
        </div>
      )}
      {default_value != null && (
        <div className="full-width">
          <hr className="map-divider" />
          <BaseButton
            onClick={onSetDefaultValue}
            disabled={form == null || form === default_value}
            className="map-button text-center full-width"
          >
            {trans('map.style-control.back-to-default')}
          </BaseButton>
        </div>
      )}
    </div>
  );
}
