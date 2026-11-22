import type { Tab } from '@hungpvq/map-dataset/style';

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
