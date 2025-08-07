import { defineComponent, h, type PropType } from 'vue';
import { useUniversalRegistry } from '../../registry';
import type { ComponentType } from '../../types';
import LayerLegendLinearGradient from './parts/linear-gradient.vue';
import LayerLegendSingleColor from './parts/single-color.vue';
import LayerLegendSingleText from './parts/single-value.vue';
export {
  LayerLegendLinearGradient,
  LayerLegendSingleColor,
  LayerLegendSingleText,
};

const componentMap = {
  linear: LayerLegendLinearGradient,
  color: LayerLegendSingleColor,
  text: LayerLegendSingleText,
} as const;
type LegendType = keyof typeof componentMap;
type LegendPropsMap = {
  linear: {
    text: string;
    items: {
      color: string;
      value: string;
    }[];
  };
  color: {
    text: string;
    color: string;
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
    attr: {
      value,
    },
  };
}

export function createMultiLegend<T extends LegendType[]>(
  legends: { type: T[number]; value: LegendPropsMap[T[number]] }[],
): ComponentType {
  return {
    componentKey: 'legend-multi',
    attr: {
      legends,
    },
  };
}
export const MultiLegend = defineComponent({
  name: 'MultiLegend',
  props: {
    legends: {
      type: Array as PropType<
        { type: LegendType; value: LegendPropsMap[LegendType] }[]
      >,
      default: () => [],
    },
    data: {
      type: Object as PropType<any>,
      default: undefined,
    },
  },
  setup(props) {
    const { getComponent } = useUniversalRegistry();
    return () =>
      props.legends.map((legend) => {
        const Component = getComponent(`legend-${legend.type}`);
        if (!Component) {
          console.warn(
            `Component for legend type "${legend.type}" not found in UniversalRegistry`,
          );
          return null;
        }
        return h(Component, { value: legend.value });
      });
  },
});
