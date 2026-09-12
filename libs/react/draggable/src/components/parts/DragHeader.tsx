import type { ReactNode } from 'react';

export type DragHeaderProps = {
  children?: ReactNode;
  preTitle?: ReactNode;
  title?: ReactNode;
  extraBtn?: ReactNode;
};

function DragHeader({ preTitle, title, extraBtn }: DragHeaderProps) {
  return (
    <>
      <hr className="map-divider" aria-hidden="true" />
      <div className="draggable-header">
        <div className="draggable-header__content">
          {preTitle}
          <div className="draggable-header__title">{title}</div>
          <div className="map-spacer"></div>
          {extraBtn}
        </div>
      </div>
      <hr className="map-divider" aria-hidden="true" />
    </>
  );
}

export { DragHeader };
