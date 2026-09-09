import type { ComponentType } from '@hungpvq/map-dataset';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { LayerLegendLinearGradient } from './parts/linear-gradient';
import { LayerLegendSingleColor } from './parts/single-color';
import { LayerLegendSingleText } from './parts/single-value';
import { MultiLegend } from './MultiLegend';

export {
  LayerLegendLinearGradient,
  LayerLegendSingleColor,
  LayerLegendSingleText,
};

type LegendType = 'linear' | 'color' | 'text';

const legendComponentKey = {
  linear: LIST_VIEW_MENU_COMPONENT_KEY.legendLinear,
  color: LIST_VIEW_MENU_COMPONENT_KEY.legendColor,
  text: LIST_VIEW_MENU_COMPONENT_KEY.legendText,
} as const;

type LegendPropsMap = {
  linear: {
    text: string;
    items: { color: string; value: string }[];
  };
  color: { text: string; color: string };
  text: { text: string; value: string };
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
    componentKey: LIST_VIEW_MENU_COMPONENT_KEY.legendMulti,
    attr: { legends },
  };
}

export { MultiLegend };
