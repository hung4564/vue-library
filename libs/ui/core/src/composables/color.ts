// Types
import type { CSSProperties, Ref } from 'vue';
import {
  getForeground,
  isCssColor,
  isParsableColor,
  parseColor,
} from '../utils/color';
import { destructComputed } from '../utils/helpers';

type ColorValue = string | false | null | undefined;

// Composables
export function useColor(
  colors: Ref<{ background?: ColorValue; text?: ColorValue }>
) {
  return destructComputed(() => {
    const classes: string[] = [];
    const styles: CSSProperties = {};

    if (colors.value.background) {
      if (isCssColor(colors.value.background)) {
        styles.backgroundColor = colors.value.background;

        if (!colors.value.text && isParsableColor(colors.value.background)) {
          const backgroundColor = parseColor(colors.value.background);
          if (backgroundColor.a == null || backgroundColor.a === 1) {
            const textColor = getForeground(backgroundColor);

            styles.color = textColor;
            styles.caretColor = textColor;
          }
        }
      } else {
        classes.push(`bg-${colors.value.background}`);
      }
    }

    if (colors.value.text) {
      if (isCssColor(colors.value.text)) {
        styles.color = colors.value.text;
        styles.caretColor = colors.value.text;
      } else {
        classes.push(`text-${colors.value.text}`);
      }
    }

    return { colorClasses: classes, colorStyles: styles };
  });
}
