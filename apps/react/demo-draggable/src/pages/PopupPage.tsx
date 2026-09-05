import {
  DraggableContainer,
  DraggableItemPopup,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/react-draggable';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export function PopupPage() {
  const [containerId, setContainerId] = useState('');

  return (
    <>
      <DraggableContainer
        containerId="demo-popup"
        className="demo-page"
        onInit={setContainerId}
      >
        <DraggableItemSideBar show title="Controls" location="left">
          <div className="panel">
            <h2>Popup demo</h2>
            <p>
              Draggable and resizable popups, including one outside the
              container.
            </p>
            <ManagementControl />
          </div>
        </DraggableItemSideBar>

        <DraggableItemPopup
          show
          title="Popup 1"
          top={20}
          right={20}
          width={300}
          height={360}
        >
          <div className="panel">
            <p>Drag the header; resize from corners.</p>
          </div>
        </DraggableItemPopup>

        <DraggableItemPopup
          show
          title="Popup 2"
          top={80}
          left={80}
          width={280}
          height={240}
        >
          <div className="panel">
            <p>Second popup inside the container.</p>
          </div>
        </DraggableItemPopup>
      </DraggableContainer>

      {containerId &&
        createPortal(
          <DraggableItemPopup
            show
            title="Popup (Portal)"
            top={20}
            left={420}
            width={280}
            height={220}
            containerId={containerId}
          >
            <div className="panel">
              <p>Rendered via Portal; same container state.</p>
            </div>
          </DraggableItemPopup>,
          document.body,
        )}
    </>
  );
}
