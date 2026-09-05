import {
  DraggableContainer,
  DraggableDrawer,
  DraggableItemBottom,
  DraggableItemFloat,
  DraggableItemPopup,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/react-draggable';
import { useState } from 'react';
import { Link } from 'react-router';

const demos = [
  { to: '/sidebar', label: 'Open Sidebar demo' },
  { to: '/popup', label: 'Open Popup demo' },
  { to: '/float', label: 'Open Float demo' },
  { to: '/bottom', label: 'Open Bottom demo' },
  { to: '/drawer', label: 'Open Drawer demo' },
  { to: '/custom-card', label: 'Open Custom card demo' },
];

export function HomePage() {
  const [drawerSize, setDrawerSize] = useState(280);

  return (
    <DraggableContainer containerId="demo-home" className="demo-page">
      <DraggableItemSideBar show title="Controls" location="left">
        <div className="panel">
          <h2>Home overview</h2>
          <p>
            Samples of each type except modal. Use the links to open focused
            demos.
          </p>
          <div className="demo-links">
            {demos.map((demo) => (
              <Link key={demo.to} to={demo.to} className="demo-btn">
                {demo.label}
              </Link>
            ))}
          </div>
          <h3>Management</h3>
          <ManagementControl />
        </div>
      </DraggableItemSideBar>

      <DraggableItemSideBar show title="Right Sidebar" location="right">
        <div className="panel">
          <h2>Right Sidebar</h2>
          <p>Overview sample — open Sidebar demo for more.</p>
        </div>
      </DraggableItemSideBar>

      <DraggableItemPopup
        show
        title="Popup"
        top={10}
        right={10}
        width={280}
        height={220}
      >
        <div className="panel">
          <p>Draggable / resizable popup sample.</p>
        </div>
      </DraggableItemPopup>

      <DraggableItemFloat
        show
        title="Float 1"
        right={10}
        bottom={10}
        width={320}
        headerLocation="bottom"
      >
        <div className="panel">
          <p>Float panel with bottom header.</p>
        </div>
      </DraggableItemFloat>

      <DraggableItemFloat
        show
        title="Float 2"
        top={10}
        left={10}
        width={280}
        maxHeight={360}
      >
        <div className="panel">
          <p>Second float panel.</p>
        </div>
      </DraggableItemFloat>

      <DraggableItemBottom show title="Bottom">
        <div className="panel">
          <p>Bottom panel overview sample.</p>
        </div>
      </DraggableItemBottom>

      <DraggableDrawer
        show
        title="Drawer 1"
        location="right"
        size={drawerSize}
        minSize={160}
        maxSize={480}
        onUpdateSize={setDrawerSize}
      >
        <div className="panel">
          Resize me ({drawerSize}px). Switch to Drawer 2 via menu.
        </div>
      </DraggableDrawer>

      <DraggableDrawer
        show={false}
        title="Drawer 2"
        location="right"
        size={drawerSize}
        minSize={160}
        maxSize={480}
        onUpdateSize={setDrawerSize}
      >
        <div className="panel">Second drawer on the same edge.</div>
      </DraggableDrawer>
    </DraggableContainer>
  );
}
