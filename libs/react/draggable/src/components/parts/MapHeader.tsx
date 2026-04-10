import { ReactNode } from 'react';
import './MapHeader.css';

export interface MapHeaderProps {
  children?: ReactNode;
  preTitle?: ReactNode;
  title?: ReactNode;
  extraBtn?: ReactNode;
}

export function MapHeader({ preTitle, title, extraBtn }: MapHeaderProps) {
  return (
    <>
      <hr className="map-divider" />
      <div className="draggable-header">
        <div className="draggable-header__content">
          {preTitle && <div>{preTitle}</div>}
          <div className="draggable-header__title">{title}</div>
          <div className="map-spacer"></div>
          {extraBtn}
        </div>
      </div>
      <hr className="map-divider" />
    </>
  );
}
