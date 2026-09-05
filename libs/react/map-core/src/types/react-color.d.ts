declare module 'react-color' {
  import type { ComponentType, CSSProperties } from 'react';

  export interface ColorResult {
    hex: string;
    rgb: { r: number; g: number; b: number; a?: number };
    hsl: { h: number; s: number; l: number; a?: number };
  }

  export interface SketchPickerProps {
    color?: string;
    disableAlpha?: boolean;
    disabled?: boolean;
    onChange?: (color: ColorResult) => void;
    onChangeComplete?: (color: ColorResult) => void;
    presetColors?: string[];
    style?: CSSProperties;
    width?: string | number;
  }

  export const SketchPicker: ComponentType<SketchPickerProps>;
}

export {};
