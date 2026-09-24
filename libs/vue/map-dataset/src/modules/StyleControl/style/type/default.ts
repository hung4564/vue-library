import { buildConfigTabs, type Tab } from '@hungpvq/map-dataset/style';
import {
  InputCheckbox,
  InputChoose,
  InputColorPicker,
  InputSelect,
  InputSlider,
  InputText,
} from '@hungpvq/vue-map-core/fields';

import InputArrayIndex from '../field/InputArrayIndex.vue';
import InputArrayXY from '../field/InputArrayXY.vue';
import InputImage from '../field/InputImage.vue';
import InputMultiple from '../field/InputMultiple.vue';
import divColor from '../label/div-color.vue';
import textAfter from '../label/text-after.vue';
import textFormat from '../label/text-format.vue';

export const CONFIG_TABS: Record<string, Partial<Tab>> = buildConfigTabs({
  'array-index': {
    content: () => InputArrayIndex,
  },
  multiple: {
    content: () => InputMultiple,
  },
  select: {
    content: () => InputSelect,
  },
  image: {
    content: () => InputImage,
  },
  color: {
    content: () => InputColorPicker,
    label: () => divColor,
  },
  boolean: {
    content: () => InputCheckbox,
  },
  chose: {
    content: () => InputChoose,
    label: () => textFormat,
  },
  opacity: {
    content: () => InputSlider,
    label: () => textFormat,
  },
  minMax: {
    content: () => InputSlider,
    label: () => textFormat,
  },
  unit: {
    content: () => InputText,
    label: () => textAfter,
  },
  number: {
    content: () => InputText,
  },
  text: {
    content: () => InputText,
  },
  'array-x-y': {
    content: () => InputArrayXY,
  },
  default: {
    content: () => InputText,
  },
});
