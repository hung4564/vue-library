import {
  InputCheckbox,
  InputChoose,
  InputColorPicker,
  InputSlider,
  InputText,
} from '@hungpvq/vue-map-core';
import { ChoseTab, Tab } from '../../../../types/style';
import { divColor, textAfter, textFormat } from '../label';

export const CONFIG_TABS: Record<string, Partial<Tab>> = {
  image: {
    component: {
      content: () => InputText,
    },
    props: {
      content: {
        class: 'tab-content-padding',
      },
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
      },
    },
  },
  boolean: {
    component: {
      content: () => InputCheckbox,
    },
    props: {
      content: {
        class: 'tab-content-padding',
      },
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
        class: 'tab-content-padding',
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
        class: 'tab-content-padding',
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
        class: 'tab-content-padding',
        type: 'number',
        min: 0,
      },
    },
    format: (value: any) => +value,
  },
  default: {
    component: {
      content: () => InputText,
    },
    props: {
      content: {
        class: 'tab-content-padding',
      },
    },
  },
};
