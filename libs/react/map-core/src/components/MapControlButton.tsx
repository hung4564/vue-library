import React, { createContext, useContext } from 'react';
import { MapButton } from './MapButton';
import { MapIcon } from './MapIcon';

interface MapControlButtonGroupContextValue {
  isGroup: boolean;
  groupSize: number;
}

const MapControlButtonGroupContext =
  createContext<MapControlButtonGroupContextValue | null>(null);

export interface MapControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string | boolean;
  tooltip?: string;
  title?: string;
  loading?: boolean;
  size?: number;
  active?: boolean;
  disabled?: boolean;
  contentButton?: React.ReactNode;
  children?: React.ReactNode;
}

export function MapControlButton({
  icon,
  tooltip,
  title,
  loading = false,
  size = 32,
  active = false,
  disabled = false,
  contentButton,
  children,
  ...props
}: MapControlButtonProps) {
  const groupContext = useContext(MapControlButtonGroupContext);
  const isGroup = groupContext?.isGroup ?? false;
  const groupSize = groupContext?.groupSize ?? 0;

  if (isGroup) {
    return (
      <MapButton
        active={active}
        height={groupSize}
        title={tooltip || title}
        width={groupSize}
        disabled={disabled}
        loading={loading}
        {...props}
      >
        {children || <MapIcon>{icon}</MapIcon>}
      </MapButton>
    );
  }

  return (
    <div className="button-container">
      <div title={tooltip || title}>
        {contentButton || (
          <MapButton
            active={active}
            height={size}
            loading={loading}
            width={size}
            disabled={disabled}
            {...props}
          >
            {children || <MapIcon>{icon}</MapIcon>}
          </MapButton>
        )}
      </div>
    </div>
  );
}

// Export context provider for MapControlGroupButton
export { MapControlButtonGroupContext };
