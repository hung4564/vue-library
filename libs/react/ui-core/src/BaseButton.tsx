import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

import {
  type UiButtonSize,
  type UiButtonVariant,
  uiButtonBindStyle,
  uiButtonSizeClass,
  uiButtonVariantClass,
} from './ui-button';

export type { UiButtonSize, UiButtonVariant };

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** icon | plain | text | tonal | outlined | filled. Default `text`. */
  variant?: UiButtonVariant;
  /** small | medium | large | number (px). Applies to every variant. */
  size?: UiButtonSize | string;
  active?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export function BaseButton({
  variant = 'text',
  size = 'medium',
  active = false,
  loading = false,
  disabled,
  className = '',
  style,
  children,
  type = 'button',
  ...rest
}: BaseButtonProps) {
  const bindStyle = uiButtonBindStyle(variant, size);
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-pressed={active}
      aria-busy={loading || undefined}
      className={[
        'ui-btn',
        uiButtonVariantClass(variant),
        uiButtonSizeClass(size),
        active ? 'ui-btn--active' : '',
        disabled ? 'ui-btn--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...bindStyle, ...(style as CSSProperties | undefined) }}
      {...rest}
    >
      <span className="ui-btn__content">
        {loading ? (
          <span
            className="ui-btn__spin"
            aria-hidden="true"
          />
        ) : (
          children
        )}
      </span>
    </button>
  );
}
