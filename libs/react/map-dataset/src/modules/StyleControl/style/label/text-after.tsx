import type { Tab } from '@hungpvq/map-dataset/style';

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
