import type { ComponentType } from '../types';

export type LegendType = 'linear' | 'color' | 'text';

/** Keep in sync with `LIST_VIEW_MENU_COMPONENT_KEY` legend* entries (avoid import cycle). */
const legendComponentKey = {
  linear: 'legend-linear',
  color: 'legend-color',
  text: 'legend-text',
} as const;

export type LegendPropsMap = {
  linear: {
    text: string;
    items: { color: string; value: string }[];
  };
  color: {
    text: string;
    color: string;
    value?: string;
  };
  text: {
    text: string;
    value: string;
  };
};

export function createLegend<T extends LegendType>(
  type: T,
  value: LegendPropsMap[T],
): ComponentType {
  return {
    componentKey: legendComponentKey[type],
    attr: { value },
  };
}

export function createMultiLegend<T extends LegendType[]>(
  legends: { type: T[number]; value: LegendPropsMap[T[number]] }[],
): ComponentType {
  return {
    componentKey: 'legend-multi',
    attr: { legends },
  };
}
