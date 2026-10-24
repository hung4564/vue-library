import { mdiCheck, mdiContentCopy } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { BaseButton, type UiButtonSize, type UiButtonVariant } from './BaseButton';

export interface CopyButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'children' | 'onClick' | 'title'
> {
  value?: string | number | null;
  title?: string;
  copiedTitle?: string;
  disabled?: boolean;
  /** icon | plain | text | tonal | outlined | filled. Default `plain`. */
  variant?: UiButtonVariant;
  /** small | medium | large | number (px). Default `small`. */
  size?: UiButtonSize | string;
  /** Icon size in px (passed to @mdi/react as `${iconSize}px`). Dense rows: 14. */
  iconSize?: number;
  /** Also render title / copiedTitle next to the icon. */
  labeled?: boolean;
}

export function CopyButton({
  value = '',
  title = 'Copy',
  copiedTitle = 'Copied',
  disabled = false,
  variant = 'plain',
  size = 'small',
  iconSize = 14,
  labeled = false,
  className,
  ...rest
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const text = value == null ? '' : String(value);
  const isDisabled = disabled || !text.trim() || text === '—';
  const label = copied ? copiedTitle : title;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    void onCopy();
  }

  return (
    <BaseButton
      {...rest}
      className={className}
      variant={variant}
      size={size}
      title={label}
      aria-label={label}
      disabled={isDisabled}
      onClick={onClick}
    >
      <Icon
        path={copied ? mdiCheck : mdiContentCopy}
        size={`${iconSize}px`}
      />
      {labeled ? <span>{label}</span> : null}
    </BaseButton>
  );
}
