import { defineComponent, h } from 'vue';
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
  value: LegendPropsMap[T]
) {
  const Component = componentMap[type];

  return () => h(Component, { value });
}

export function createMultiLegend<T extends LegendType[]>(
  legends: { type: T[number]; value: LegendPropsMap[T[number]] }[]
) {
  return () =>
    defineComponent({
      name: 'MultiLegend',
      setup() {
        return () => {
          return legends.map((legend) => {
            const Component = componentMap[legend.type];
            return h(Component, { value: legend.value });
          });
        };
      },
    });
}
