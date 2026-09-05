import {
  DraggableContainer,
  DraggableDrawer,
  DraggableItemFloat,
  DraggableItemPopup,
  DraggableItemSideBar,
  DraggableModal,
  ManagementControl,
  useDragComponent,
} from '@hungpvq/react-draggable';
import { useLayoutEffect, useState } from 'react';
import { GlobalCard } from '../components/custom-cards/GlobalCard';
import { GlobalHeader } from '../components/custom-cards/GlobalHeader';
import { LocalCard } from '../components/custom-cards/LocalCard';
import { LocalHeader } from '../components/custom-cards/LocalHeader';

export function CustomCardPage() {
  const cards = useDragComponent();
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [drawerSize, setDrawerSize] = useState(260);

  useLayoutEffect(() => {
    cards.setComponentCard(GlobalCard);
    cards.setComponentCardHeader(GlobalHeader);
    setReady(true);
    return () => {
      cards.clearAllComponentCards();
    };
    // Store API is stable; avoid re-running when `cards` object identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  return (
    <DraggableContainer containerId="demo-custom-card" className="demo-page">
      <DraggableItemSideBar show title="Controls" location="left">
        <div className="panel">
          <h2>Custom card</h2>
          <p>
            Green cards come from the global store. Orange cards use local{' '}
            <code>componentCard</code> props (override global).
          </p>
          <ManagementControl />
        </div>
      </DraggableItemSideBar>

      <DraggableItemSideBar show title="Sidebar (global)" location="right">
        <div className="panel">
          <p>
            Sidebar uses global card (store) — no local override API on shell.
          </p>
        </div>
      </DraggableItemSideBar>

      <DraggableItemPopup
        show
        title="Popup (global)"
        top={12}
        right={12}
        width={260}
        height={200}
      >
        <div className="panel">Uses global custom card.</div>
      </DraggableItemPopup>

      <DraggableItemPopup
        show
        title="Popup (local)"
        top={230}
        right={12}
        width={260}
        height={200}
        componentCard={LocalCard}
        componentCardHeader={LocalHeader}
      >
        <div className="panel">Local override on popup.</div>
      </DraggableItemPopup>

      <DraggableItemFloat
        show
        title="Float (global)"
        left={12}
        bottom={12}
        width={280}
      >
        <div className="panel">Uses global custom card.</div>
      </DraggableItemFloat>

      <DraggableItemFloat
        show
        title="Float (local)"
        left={310}
        bottom={12}
        width={280}
        componentCard={LocalCard}
        componentCardHeader={LocalHeader}
      >
        <div className="panel">Local override on float.</div>
      </DraggableItemFloat>

      <DraggableDrawer
        show
        title="Drawer (global)"
        location="bottom"
        size={drawerSize}
        minSize={140}
        maxSize={360}
        onUpdateSize={setDrawerSize}
      >
        <div className="panel">Drawer with global card.</div>
      </DraggableDrawer>

      <DraggableModal
        show={showModal}
        title="Modal (local)"
        width={360}
        height={200}
        componentCard={LocalCard}
        componentCardHeader={LocalHeader}
        onUpdateShow={setShowModal}
      >
        <div className="panel">Modal with local custom card.</div>
      </DraggableModal>
    </DraggableContainer>
  );
}
