import type { MapControlButtonUIState } from '@hungpvq/map-core';
import { Icon } from '@mdi/react';
import React from 'react';
import { MapControlButton } from './MapControlButton';

export interface MapCommonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  option: MapControlButtonUIState;
}

export function MapCommonButton({
  option,
  className = '',
  ...props
}: MapCommonButtonProps) {
  if (option.visible === false) {
    return null;
  }

  return (
    <MapControlButton
      title={option.title}
      className={`${option.active ? 'active' : ''} ${className}`}
      disabled={option.disabled}
      loading={option.loading}
      {...props}
    >
      {option.icon?.type === 'compass' ? (
        <svg
          height="22"
          style={{ transform: option.icon.transform }}
          viewBox="0 0 24 24"
          width="22"
        >
          <g fill="none" fillRule="evenodd">
            <path d="M0 0h24v24H0z"></path>
            <path d="M12 3l4 8H8z" fill="#f44336"></path>
            <path d="M12 21l-4-8h8z" fill="#9E9E9E"></path>
          </g>
        </svg>
      ) : option.icon?.type === 'mdi' && option.icon.path ? (
        <Icon path={option.icon.path} size="18px" />
      ) : null}
    </MapControlButton>
  );
}
