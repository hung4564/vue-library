import React, { useState } from 'react';
import {
  DraggableContainer,
  DraggableItemFloat,
  DraggableItemPopup,
  DraggableItemSideBar,
} from '@hungpvq/react-draggable';
import { createPortal } from 'react-dom';

function App() {
  const [containerId, setContainerId] = useState<string>('');

  function handleInit(id: string) {
    setContainerId(id);
    console.info('Container initialized:', id);
  }

  function handleChangeShow(value: { show: any; idsShow: string[] }) {
    console.info('onChangeShow', value);
  }

  return (
    <>
      <DraggableContainer
        containerId="test"
        onInit={handleInit}
        onChangeShow={handleChangeShow}
      >
        <DraggableItemSideBar show title="Right Sidebar 1" location="right">
          <div style={{ height: '100vh', padding: '20px' }}>
            <h2>Right Sidebar 1</h2>
            <p>This is the first right sidebar</p>
            <p>
              You can switch between multiple sidebars using the menu button
            </p>
          </div>
        </DraggableItemSideBar>

        <DraggableItemSideBar show title="Right Sidebar 2" location="right">
          <div style={{ height: '100vh', padding: '20px' }}>
            <h2>Right Sidebar 2</h2>
            <p>This is the second right sidebar</p>
            <p>Click the menu icon to switch between sidebars</p>
          </div>
        </DraggableItemSideBar>

        <DraggableItemSideBar show title="Left Sidebar" location="left">
          <div style={{ height: '100vh', padding: '20px' }}>
            <h2>Left Sidebar</h2>
            <p>This is a left sidebar example</p>
            <ul>
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </div>
        </DraggableItemSideBar>

        <DraggableItemPopup
          show
          title="Popup 1"
          top={10}
          right={10}
          width={300}
          height={400}
        >
          <div style={{ height: '100vh', padding: '20px' }}>
            <h3>Popup 1</h3>
            <p>This is a draggable and resizable popup</p>
            <p>You can drag it by the header and resize it from the corners</p>
          </div>
        </DraggableItemPopup>

        <DraggableItemFloat
          show
          title="Float Panel 1"
          right={10}
          bottom={10}
          width={400}
          headerLocation="bottom"
        >
          <div style={{ height: '100vh', padding: '20px' }}>
            <h3>Float Panel</h3>
            <p>This is a floating panel that can be positioned anywhere</p>
            <p>Header is at the bottom in this example</p>
          </div>
        </DraggableItemFloat>

        <DraggableItemFloat
          show
          title="Float Panel 2"
          top={10}
          left={10}
          width={350}
          maxHeight={500}
        >
          <div style={{ padding: '20px' }}>
            <h3>Another Float Panel</h3>
            <p>Multiple float panels can be displayed simultaneously</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </div>
        </DraggableItemFloat>
      </DraggableContainer>

      {containerId && document.body && (
        <>
          {createPortal(
            <DraggableItemPopup
              show
              title="Popup 2 (Outside Container)"
              top={10}
              left={420}
              width={300}
              height={400}
              containerId={containerId}
            >
              <div style={{ height: '100vh', padding: '20px' }}>
                <h3>Popup 2</h3>
                <p>
                  This popup is rendered outside the container using React
                  Portal
                </p>
                <p>It still uses the same container for state management</p>
              </div>
            </DraggableItemPopup>,
            document.body,
          )}
        </>
      )}
    </>
  );
}

export default App;
