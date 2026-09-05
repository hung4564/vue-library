import type { Tab } from '@hungpvq/map-dataset';

export type TransFn = (key: string) => string;

export function resolveTabProps(
  props: unknown,
  tab: Tab,
): Record<string, unknown> {
  if (!props) return {};
  if (typeof props === 'function') {
    return (
      (props as (item: Tab) => Record<string, unknown>)(tab) ?? {}
    );
  }
  return { ...(props as Record<string, unknown>) };
}

export function toReactFieldProps(raw: Record<string, unknown>) {
  const { class: cssClass, className, disableAlpha: _disableAlpha, ...rest } =
    raw;
  return {
    ...rest,
    className: (className || cssClass) as string | undefined,
  };
}
