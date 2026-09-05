import { ReactNode, useState } from 'react';

export interface GroupItemProps {
  title: string;
  collapsed?: boolean;
  children: ReactNode;
}

export function GroupItem({
  title,
  collapsed: initialCollapsed = false,
  children,
}: GroupItemProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <div className="group-item">
      <div
        className="group-item__header"
        onClick={() => setCollapsed((value) => !value)}
      >
        <div className="group-item__icon-column">
          <span
            className={`group-item__toggle${collapsed ? ' group-item__toggle--collapsed' : ''}`}
          >
            ▶
          </span>
          {!collapsed ? <span className="group-item__line" /> : null}
        </div>
        <span className="group-item__title">{title}</span>
      </div>
      {!collapsed ? <div className="group-item__body">{children}</div> : null}
    </div>
  );
}
