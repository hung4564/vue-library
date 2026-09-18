import { MapControlButton } from '@hungpvq/react-map-core';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import Icon from '@mdi/react';

export type ToggleShowButtonProps = {
  show: boolean;
  disabled?: boolean;
  title: string;
  onToggle: () => void;
};

export function ToggleShowButton({
  show,
  disabled,
  title,
  onToggle,
}: ToggleShowButtonProps) {
  return (
    <MapControlButton
      disabled={disabled}
      title={title}
      onClick={onToggle}
      variant="plain"
      size="small"
    >
      <Icon path={show ? mdiEye : mdiEyeOff} size="14px" />
    </MapControlButton>
  );
}
