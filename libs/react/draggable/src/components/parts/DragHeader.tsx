import type { ReactNode } from 'react';

export type DragHeaderProps = {
  children?: ReactNode;
  preTitle?: ReactNode;
  title?: ReactNode;
  /** Immediately to the right of title (header slot contract). */
  afterTitle?: ReactNode;
  extraBtn?: ReactNode;
};

function DragHeader({ preTitle, title, afterTitle, extraBtn }: DragHeaderProps) {
  return (
    <>
      <hr className="map-divider" aria-hidden="true" />
      <div className="draggable-header">
        <div className="draggable-header__content">
          {preTitle}
          <div className="draggable-header__title">
            <div className="draggable-header__title-text">{title}</div>
            {afterTitle != null && afterTitle !== false ? (
              <div className="draggable-header__after-title">{afterTitle}</div>
            ) : null}
          </div>
          <div className="map-spacer"></div>
          {extraBtn}
        </div>
      </div>
      <hr className="map-divider" aria-hidden="true" />
    </>
  );
}

export { DragHeader };
