import React, { useState, useEffect } from 'react';
import { Icon } from '@mdi/react';
import { mdiMenuDown, mdiMenuUp } from '@mdi/js';

export interface BaseCollapseProps {
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
  header?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function BaseCollapse({
  selected = true,
  onSelectedChange,
  onOpen,
  onClose,
  header,
  children,
  className = '',
}: BaseCollapseProps) {
  const [active, setActive] = useState(selected);

  useEffect(() => {
    setActive(selected);
  }, [selected]);

  const toggle = () => {
    const newActive = !active;
    setActive(newActive);
    onSelectedChange?.(newActive);
    if (newActive) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  const classes = [
    'collapse',
    'collapse-item',
    active ? 'is-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div
        className="collapse-header touchable"
        role="tab"
        aria-expanded={active ? 'true' : 'false'}
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
      >
        <div className="collapse-header__title">{header}</div>
        <div className="collapse-header__icon">
          {active ? (
            <Icon path={mdiMenuUp} size="14px" />
          ) : (
            <Icon path={mdiMenuDown} size="14px" />
          )}
        </div>
      </div>
      {active && (
        <div className="collapse-content">
          <div className="collapse-content-box">{children}</div>
        </div>
      )}
    </div>
  );
}
