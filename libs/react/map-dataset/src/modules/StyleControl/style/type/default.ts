import {
  InputCheckbox,
  InputChoose,
  InputColorPicker,
  InputSelect,
  InputSlider,
  InputText,
} from '@hungpvq/react-map-core/fields';
import { buildConfigTabs, type Tab } from '@hungpvq/map-dataset/style';
import { InputArrayIndex } from '../field/InputArrayIndex';
import { InputArrayXY } from '../field/InputArrayXY';
import { InputImage } from '../field/InputImage';
import { InputMultiple } from '../field/InputMultiple';
import { DivColor } from '../label/div-color';
import { TextAfter } from '../label/text-after';
import { TextFormat } from '../label/text-format';

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
    label: () => DivColor,
  },
  boolean: {
    content: () => InputCheckbox,
  },
  chose: {
    content: () => InputChoose,
    label: () => TextFormat,
  },
  opacity: {
    content: () => InputSlider,
    label: () => TextFormat,
  },
  minMax: {
    content: () => InputSlider,
    label: () => TextFormat,
  },
  unit: {
    content: () => InputText,
    label: () => TextAfter,
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
