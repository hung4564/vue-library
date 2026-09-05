import {
  DraggableContainer,
  DraggableItemSideBar,
  DraggableModal,
  ManagementControl,
} from '@hungpvq/react-draggable';
import { useState } from 'react';

export function ModalPage() {
  const [showOuter, setShowOuter] = useState(true);
  const [showInner, setShowInner] = useState(false);
  const [showThird, setShowThird] = useState(false);

  return (
    <DraggableContainer containerId="demo-modal" className="demo-page">
      <DraggableItemSideBar show title="Controls" location="left">
        <div className="panel">
          <h2>Modal demo</h2>
          <p>
            Open a nested modal from inside another. Later opens stack on top.
          </p>
          <div className="actions">
            <button
              type="button"
              className="demo-btn"
              onClick={() => setShowOuter(true)}
            >
              Open outer modal
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => setShowThird(true)}
            >
              Open sibling modal
            </button>
          </div>
          <ManagementControl />
        </div>
      </DraggableItemSideBar>

      <DraggableModal
        show={showOuter}
        title="Outer modal"
        width={440}
        height={280}
        maskClosable={false}
        onUpdateShow={setShowOuter}
      >
        <div className="panel">
          <p>This is the outer modal. Open a child modal from here:</p>
          <div className="actions">
            <button
              type="button"
              className="demo-btn"
              onClick={() => setShowInner(true)}
            >
              Open nested modal
            </button>
          </div>
        </div>
      </DraggableModal>

      <DraggableModal
        show={showInner}
        title="Nested modal"
        width={340}
        height={220}
        top={120}
        left={180}
        center={false}
        maskClosable
        onUpdateShow={setShowInner}
      >
        <div className="panel">
          <p>
            Nested modal opened from the outer one — stacks above by open order.
          </p>
          <button
            type="button"
            className="demo-btn"
            onClick={() => setShowInner(false)}
          >
            Close nested
          </button>
        </div>
      </DraggableModal>

      <DraggableModal
        show={showThird}
        title="Sibling modal"
        width={320}
        height={200}
        top={160}
        left={260}
        center={false}
        onUpdateShow={setShowThird}
      >
        <div className="panel">
          <p>Opened from the control panel (sibling, not nested).</p>
        </div>
      </DraggableModal>
    </DraggableContainer>
  );
}
