import type { ReactNode } from 'react';

export interface LocalHeaderProps {
  children?: ReactNode;
  preTitle?: ReactNode;
  title?: ReactNode;
  extraBtn?: ReactNode;
}

export function LocalHeader({ preTitle, title, extraBtn }: LocalHeaderProps) {
  return (
    <div className="custom-header custom-header--local">
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
