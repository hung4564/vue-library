import {
  createCopyFeedback,
  type MapButtonSize,
  type MapButtonVariant,
} from '@hungpvq/map-core';
import { mdiCheck, mdiContentCopy } from '@mdi/js';
import { Icon } from '@mdi/react';
import React, { type MouseEvent, useEffect, useRef, useState } from 'react';

import { MapControlButton } from './MapControlButton';

export interface MapCopyButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'children' | 'onClick' | 'title'
> {
  /** Text copied to the clipboard. */
  value?: string | number | null;
  title?: string;
  copiedTitle?: string;
  variant?: MapButtonVariant;
  size?: MapButtonSize | string;
  disabled?: boolean;
  /** Icon size in px (passed to @mdi/react as `${iconSize}px`). Dense rows: 14. */
  iconSize?: number;
  className?: string;
}

/**
 * Shared copy action button: clipboard + mdiContentCopy → mdiCheck feedback
 * (~1.5s). Prefer this over ad-hoc MapControlButton + createCopyFeedback.
 */
export function MapCopyButton({
  value = '',
  title = 'Copy',
  copiedTitle = 'Copied',
  variant = 'plain',
  size = 'small',
  disabled = false,
  iconSize = 14,
  className,
  ...props
}: MapCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const copyFeedbackRef = useRef(
    createCopyFeedback({
      onChange: (key) => setCopied(key === 'copy'),
    }),
  );

  useEffect(() => () => copyFeedbackRef.current.dispose(), []);

  const text = value == null ? '' : String(value);
  const trimmed = text.trim();
  const isDisabled = disabled || !trimmed || trimmed === '—';
  const label = copied ? copiedTitle : title;

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    void copyFeedbackRef.current.copy('copy', text);
  }

  return (
    <MapControlButton
      {...props}
      className={className}
      variant={variant}
      size={size}
      disabled={isDisabled}
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <Icon path={copied ? mdiCheck : mdiContentCopy} size={`${iconSize}px`} />
    </MapControlButton>
  );
}
