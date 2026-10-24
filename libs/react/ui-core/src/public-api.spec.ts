import { describe, expect, it } from 'vitest';

import * as api from './index';

export const REACT_UI_CORE_RUNTIME_EXPORTS = [
  'BaseButton',
  'BaseCollapse',
  'Collapse',
  'CopyButton',
  'DragDropFile',
  'Icon',
  'InputActionRow',
  'InputCheckbox',
  'InputChoose',
  'InputColorPicker',
  'InputFile',
  'InputSelect',
  'InputSlider',
  'InputText',
  'InputTextArea',
  'InputTextarea',
  'Tabs',
] as const;

describe('public API surface', () => {
  it('root runtime exports match allowlist', () => {
    expect(Object.keys(api).sort()).toEqual(
      [...REACT_UI_CORE_RUNTIME_EXPORTS].sort(),
    );
  });
});
