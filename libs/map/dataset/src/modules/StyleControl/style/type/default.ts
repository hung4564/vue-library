import {
  InputCheckbox,
  InputChoose,
  InputColorPicker,
  InputSelect,
  InputSlider,
  InputText,
} from '@hungpvq/vue-map-core';
import InputArrayIndex from '../field/InputArrayIndex.vue';
import InputArrayXY from '../field/InputArrayXY.vue';
import InputImage from '../field/InputImage.vue';
import InputMultiple from '../field/InputMultiple.vue';
import { divColor, textAfter, textFormat } from '../label';
import type { ArrayIndexTab, ChoseTab, SelectTab, Tab } from './style';

export const CONFIG_TABS: Record<string, Partial<Tab>> = {
  'array-index': {
    component: {
      content: () => InputArrayIndex,
    },
    props: {
      content: (tab: ArrayIndexTab) => ({
        items: tab.data,
      }),
    },
  },
  multiple: {
    component: {
      content: () => InputMultiple,
    },
    props: {},
  },
  select: {
    component: {
      content: () => InputSelect,
    },
    props: {
      content: (tab: SelectTab) => ({
        items: tab.items,
      }),
    },
  },
  image: {
    component: {
      content: () => InputImage,
    },
    props: {
      content: {},
    },
  },
  color: {
    component: {
      content: () => InputColorPicker,
      label: () => divColor,
    },
    props: {
      content: {
        disableAlpha: true,
        class: 'tab-content-no-padding',
      },
    },
  },
  boolean: {
    component: {
      content: () => InputCheckbox,
    },
    props: {
      content: {},
    },
  },
  chose: {
    component: {
      content: () => InputChoose,
      label: () => textFormat,
    },
    props: {
      content: (tab: ChoseTab) => {
        return { items: tab.menu, class: 'tab-content-padding' };
      },
      label: (tab: ChoseTab) => {
        return {
          format(value: string) {
            return tab.menu.find((x) => x.value == value)?.text;
          },
        };
      },
    },
  },
  opacity: {
    component: {
      content: () => InputSlider,
      label: () => textFormat,
    },
    props: {
      content: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      label: {
        format: (value: number) => {
          return `${(+value * 100).toFixed(0)} %`;
        },
      },
    },
    format: (value: any) => +value,
  },
  minMax: {
    component: {
      content: () => InputSlider,
      label: () => textFormat,
    },
    props: {
      content: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      label: {
        format: (value: number) => {
          return `${(+value).toFixed(2)}`;
        },
      },
    },
    format: (value: any) => +value,
  },
  unit: {
    component: {
      content: () => InputText,
      label: () => textAfter,
    },
    props: {
      content: {
        type: 'number',
        min: 0,
      },
    },
    format: (value: any) => +value,
  },
  number: {
    component: {
      content: () => InputText,
    },
    props: {
      content: {
        type: 'number',
        min: 0,
      },
    },
    format: (value: any) => +value,
  },
  text: {
    component: {
      content: () => InputText,
    },
    props: {
      content: {},
    },
  },
  'array-x-y': {
    component: {
      content: () => InputArrayXY,
    },
    props: {},
  },
  default: {
    component: {
      content: () => InputText,
    },
    props: {
      content: {},
    },
  },
};
