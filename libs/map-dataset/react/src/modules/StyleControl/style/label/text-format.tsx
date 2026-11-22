import type { Tab } from '@hungpvq/map-dataset/style';

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
