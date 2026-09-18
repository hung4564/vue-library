import {
  ContextMenu,
  ContextMenuItem,
  DraggableContainer,
  DraggableItemSideBar,
  type ContextMenuRef,
} from '@hungpvq/react-draggable';
import { useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

type MenuAction = 'open' | 'rename' | 'share' | 'delete' | 'disabled';

const ITEMS: { id: MenuAction; label: string; disabled?: boolean }[] = [
  { id: 'open', label: 'Open' },
  { id: 'rename', label: 'Rename' },
  { id: 'share', label: 'Share' },
  { id: 'delete', label: 'Delete' },
  { id: 'disabled', label: 'Disabled action', disabled: true },
];

export function MenuPage() {
  const menuRef = useRef<ContextMenuRef>(null);
  const [lastAction, setLastAction] = useState('—');
  const [activeId, setActiveId] = useState<MenuAction>('open');

  function openMenu(e: ReactMouseEvent | MouseEvent) {
    e.preventDefault();
    menuRef.current?.open(e);
  }

  function onSelect(id: MenuAction) {
    if (id === 'disabled') return;
    setActiveId(id);
    setLastAction(id);
    menuRef.current?.close();
  }

  return (
    <DraggableContainer
      containerId="demo-menu"
      className="demo-page"
      variant="plain"
    >
      <DraggableItemSideBar show title="Menu demo" location="left">
        <div className="panel">
          <h2>ContextMenu + ContextMenuItem</h2>
          <p>
            Experimental menu chrome: <code>role=&quot;menu&quot;</code> /{' '}
            <code>menuitem</code>, Esc, Arrow Up/Down, Home/End, Enter/Space.
          </p>
          <ul className="demo-list">
            <li>
              <strong>Right-click</strong> the canvas → open at pointer.
            </li>
            <li>
              <strong>Click</strong> “Open from button” → same menu API{' '}
              <code>ref.open(event)</code>.
            </li>
            <li>
              <strong>Active</strong> item uses <code>active</code> prop.
            </li>
            <li>
              <strong>Disabled</strong> item uses <code>disabled</code> (skipped
              by keyboard).
            </li>
            <li>After open, try Arrow keys then Enter to activate.</li>
          </ul>
          <div className="actions">
            <button type="button" className="demo-btn" onClick={openMenu}>
              Open from button
            </button>
          </div>
          <p>
            Last action: <strong>{lastAction}</strong>
          </p>
        </div>
      </DraggableItemSideBar>

      <div className="menu-canvas" onContextMenu={openMenu}>
        <p className="menu-canvas__hint">
          Right-click anywhere here, or use the button in the sidebar.
        </p>
      </div>

      <ContextMenu ref={menuRef}>
        <ul className="context-menu">
          {ITEMS.map((item) => (
            <ContextMenuItem
              key={item.id}
              active={activeId === item.id}
              disabled={item.disabled}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </ContextMenuItem>
          ))}
        </ul>
      </ContextMenu>
    </DraggableContainer>
  );
}
