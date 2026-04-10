import React, { useState } from 'react';
import {
  DraggableContainer,
  DraggableItemFloat,
  DraggableItemPopup,
} from '@hungpvq/react-draggable';
import { CustomCard } from './CustomCard';
import { CustomCardHeader } from './CustomCardHeader';

/**
 * Example using custom Card and Header components
 */
export function AppWithCustomComponents() {
  const [containerId, setContainerId] = useState<string>('');

  function handleInit(id: string) {
    setContainerId(id);
  }

  return (
    <DraggableContainer containerId="custom-demo" onInit={handleInit}>
      <DraggableItemFloat
        show
        title="Custom Styled Panel"
        right={10}
        top={10}
        width={400}
        componentCard={CustomCard}
        componentCardHeader={CustomCardHeader}
      >
        <div style={{ padding: '20px' }}>
          <h3>Custom Components Example</h3>
          <p>This panel uses custom Card and Header components</p>
        </div>
      </DraggableItemFloat>

      <DraggableItemPopup
        show
        title="Custom Popup"
        top={100}
        left={10}
        width={350}
        height={300}
        componentCard={CustomCard}
        componentCardHeader={CustomCardHeader}
      >
        <div style={{ padding: '20px' }}>
          <p>This popup also uses custom components</p>
        </div>
      </DraggableItemPopup>
    </DraggableContainer>
  );
}
