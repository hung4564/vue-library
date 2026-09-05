import type { ComponentType } from '@hungpvq/map-dataset';

type LegendType = 'linear' | 'color' | 'text';

type LegendPropsMap = {
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
    componentKey: `legend-${type}`,
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
