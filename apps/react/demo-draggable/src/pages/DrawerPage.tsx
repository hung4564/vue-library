import {
  DraggableContainer,
  DraggableDrawer,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/react-draggable';
import { useState } from 'react';

export function DrawerPage() {
  const [drawerSize, setDrawerSize] = useState(300);

  return (
    <DraggableContainer containerId="demo-drawer" className="demo-page">
      <DraggableItemSideBar show title="Controls" location="left">
        <div className="panel">
          <h2>Drawer demo</h2>
          <p>
            Two drawers on the same edge share size and switch via the drawer
            menu.
          </p>
          <ManagementControl />
        </div>
      </DraggableItemSideBar>

      <DraggableDrawer
        show
        title="Drawer Right 1"
        location="right"
        size={drawerSize}
        minSize={160}
        maxSize={520}
        onUpdateSize={setDrawerSize}
      >
        <div className="panel">
          Right drawer 1 — {drawerSize}px. Use menu to open Drawer 2.
        </div>
      </DraggableDrawer>

      <DraggableDrawer
        show={false}
        title="Drawer Right 2"
        location="right"
        size={drawerSize}
        minSize={160}
        maxSize={520}
        onUpdateSize={setDrawerSize}
      >
        <div className="panel">Right drawer 2 on the same edge.</div>
      </DraggableDrawer>

      <DraggableDrawer
        show={false}
        title="Drawer Left"
        location="left"
        size={260}
        minSize={160}
        maxSize={400}
      >
        <div className="panel">
          Left edge drawer — open via ManagementControl.
        </div>
      </DraggableDrawer>
    </DraggableContainer>
  );
}
