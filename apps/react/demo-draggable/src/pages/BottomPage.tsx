import {
  DraggableContainer,
  DraggableItemBottom,
  DraggableItemSideBar,
  ManagementControl,
} from '@hungpvq/react-draggable';

export function BottomPage() {
  return (
    <DraggableContainer containerId="demo-bottom" className="demo-page">
      <DraggableItemSideBar show title="Controls" location="left">
        <div className="panel">
          <h2>Bottom demo</h2>
          <p>Bottom sheet style panels.</p>
          <ManagementControl />
        </div>
      </DraggableItemSideBar>

      <DraggableItemBottom show title="Bottom panel 1">
        <div className="panel">
          <p>Primary bottom item.</p>
        </div>
      </DraggableItemBottom>

      <DraggableItemBottom show={false} title="Bottom panel 2">
        <div className="panel">
          <p>Second bottom item — toggle via ManagementControl.</p>
        </div>
      </DraggableItemBottom>
    </DraggableContainer>
  );
}
