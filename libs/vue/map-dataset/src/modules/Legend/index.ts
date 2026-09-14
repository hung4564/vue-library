import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { useUniversalRegistry } from '@hungpvq/vue-map-core';
import { defineComponent, h, type PropType } from 'vue';
import { logger } from '../../logger';
import LayerLegendLinearGradient from './parts/linear-gradient.vue';
import LayerLegendSingleColor from './parts/single-color.vue';
import LayerLegendSingleText from './parts/single-value.vue';

export {
  LayerLegendLinearGradient,
  LayerLegendSingleColor,
  LayerLegendSingleText,
};

const legendComponentKey = {
  linear: LIST_VIEW_MENU_COMPONENT_KEY.legendLinear,
  color: LIST_VIEW_MENU_COMPONENT_KEY.legendColor,
  text: LIST_VIEW_MENU_COMPONENT_KEY.legendText,
} as const;

type LegendType = keyof typeof legendComponentKey;

export const MultiLegend = defineComponent({
  name: 'MultiLegend',
  props: {
    legends: {
      type: Array as PropType<
        { type: LegendType; value: Record<string, unknown> }[]
      >,
      default: () => [],
    },
    data: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },
    mapId: String,
  },
  setup(props) {
    const { getComponent } = useUniversalRegistry();
    return () =>
      props.legends.map((legend) => {
        const Component = getComponent(legendComponentKey[legend.type]);
        if (!Component) {
          logger.warn(
            `Component for legend type "${legend.type}" not found in UniversalRegistry`,
          );
          return null;
        }
        return h(Component, { value: legend.value });
      });
  },
});
