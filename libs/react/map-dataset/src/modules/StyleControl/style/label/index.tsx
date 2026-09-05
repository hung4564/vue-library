import type { Tab } from '@hungpvq/map-dataset';

export function DivColor({
  value,
  default_value,
}: {
  value?: string;
  default_value?: string;
  tab?: Tab;
}) {
  const color = value || default_value || 'transparent';
  return (
    <div
      className={!value && !default_value ? 'fill-canvas' : undefined}
      style={{
        border: '1px solid #ccc',
        width: 20,
        height: 20,
        backgroundColor: color,
        borderRadius: 5,
      }}
    />
  );
}

export function TextAfter({
  value,
  default_value,
  tab,
}: {
  value?: unknown;
  default_value?: unknown;
  tab?: Tab & { unit?: string };
}) {
  return (
    <div>
      {String(value ?? default_value ?? '0')} {tab?.unit || ''}
    </div>
  );
}

export function TextFormat({
  value,
  default_value,
  format = () => '',
}: {
  value?: unknown;
  default_value?: unknown;
  format?: (value: unknown) => unknown;
  tab?: Tab;
}) {
  const current = value != null ? value : default_value;
  return <div>{String(format(current ?? '0') ?? '')}</div>;
}
