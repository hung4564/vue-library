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
          <p>
            Only one bottom sheet is visible. Open the header menu to switch
            panels (or use ManagementControl).
          </p>
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
          <p>Second bottom — switch via the bottom header menu.</p>
        </div>
      </DraggableItemBottom>

      <DraggableItemBottom show={false} title="Bottom panel 3">
        <div className="panel">
          <p>Third bottom — exclusive with the others.</p>
        </div>
      </DraggableItemBottom>
    </DraggableContainer>
  );
}
