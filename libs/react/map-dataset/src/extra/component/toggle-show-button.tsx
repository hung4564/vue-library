import { MapControlButton } from '@hungpvq/react-map-core';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { Icon } from '@mdi/react';

export type ToggleShowButtonProps = {
  show: boolean;
  disabled?: boolean;
  title: string;
  onToggle: () => void;
  /** Match LayerControl header siblings (`medium` + 16px); rows keep `small` + 14px. */
  size?: 'small' | 'medium' | 'large' | number;
  iconSize?: string | number;
};

export function ToggleShowButton({
  show,
  disabled,
  title,
  onToggle,
  size = 'small',
  iconSize = '14px',
}: ToggleShowButtonProps) {
  const resolvedIconSize =
    typeof iconSize === 'number' ? `${iconSize}px` : iconSize;

  return (
    <MapControlButton
      disabled={disabled}
      title={title}
      onClick={onToggle}
      variant="plain"
      size={size}
    >
      <Icon
        path={show ? mdiEye : mdiEyeOff}
        size={resolvedIconSize}
      />
    </MapControlButton>
  );
}
