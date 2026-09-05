import {
  InputCheckbox,
  InputChoose,
  InputColorPicker,
  InputSelect,
  InputSlider,
  InputText,
} from '@hungpvq/react-map-core';
import { InputArrayIndex } from '../field/InputArrayIndex';
import { InputArrayXY } from '../field/InputArrayXY';
import { InputImage } from '../field/InputImage';
import { InputMultiple } from '../field/InputMultiple';
import { DivColor, TextAfter, TextFormat } from '../label';
import type { ArrayIndexTab, ChoseTab, SelectTab, Tab } from '@hungpvq/map-dataset';

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
      label: () => DivColor,
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
      label: () => TextFormat,
    },
    props: {
      content: (tab: ChoseTab) => {
        return { items: tab.menu, class: 'tab-content-padding' };
      },
      label: (tab: ChoseTab) => {
        return {
          format(value: string) {
            return tab.menu.find((x) => x.value === value)?.text;
          },
        };
      },
    },
  },
  opacity: {
    component: {
      content: () => InputSlider,
      label: () => TextFormat,
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
    format: (value: unknown) => +(value as number),
  },
  minMax: {
    component: {
      content: () => InputSlider,
      label: () => TextFormat,
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
    format: (value: unknown) => +(value as number),
  },
  unit: {
    component: {
      content: () => InputText,
      label: () => TextAfter,
    },
    props: {
      content: {
        type: 'number',
        min: 0,
      },
    },
    format: (value: unknown) => +(value as number),
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
    format: (value: unknown) => +(value as number),
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
