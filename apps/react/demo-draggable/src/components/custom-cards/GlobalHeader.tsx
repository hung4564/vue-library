import type { ReactNode } from 'react';

export interface GlobalHeaderProps {
  children?: ReactNode;
  preTitle?: ReactNode;
  title?: ReactNode;
  extraBtn?: ReactNode;
}

export function GlobalHeader({ preTitle, title, extraBtn }: GlobalHeaderProps) {
  return (
    <div className="custom-header custom-header--global">
      <hr className="map-divider" />
      <div className="draggable-header">
        <div className="draggable-header__content">
          {preTitle}
          <div className="draggable-header__title">{title}</div>
          <div className="map-spacer" />
          {extraBtn}
        </div>
      </div>
      <hr className="map-divider" />
    </div>
  );
}
