import { useIcon } from '../../hook';
import { useDragContainer } from '../../store';
import { DragButton } from '../parts/DragButton';
import { ItemList } from './ItemList';

export interface ShowStatusDragItemProps {
  items: string[];
  itemShows: string[];
  containerId: string;
}

export function ShowStatusDragItem({
  items,
  itemShows,
  containerId,
}: ShowStatusDragItemProps) {
  const { HighlightIcon, ShowIcon, HideIcon } = useIcon();
  const { getItemAction } = useDragContainer(containerId);

  function onHighLight(id: string) {
    getItemAction(id)?.setHighLight?.();
  }
  function onOpen(id: string) {
    getItemAction(id)?.open?.();
  }
  function onClose(id: string) {
    getItemAction(id)?.close?.();
  }

  return (
    <div className="mgmt-groups">
      <ItemList
        items={items}
        itemShows={itemShows}
        containerId={containerId}
        renderExtra={(item, show) => (
          <>
            {show && (
              <DragButton
                onClick={() => onHighLight(item)}
                title="Highlight"
                aria-label="Highlight"
              >
                <HighlightIcon size={16} />
              </DragButton>
            )}
            {!show ? (
              <DragButton onClick={() => onOpen(item)} title="Show" aria-label="Show">
                <ShowIcon size={16} />
              </DragButton>
            ) : (
              <DragButton onClick={() => onClose(item)} title="Hide" aria-label="Hide">
                <HideIcon size={16} />
              </DragButton>
            )}
          </>
        )}
      />
    </div>
  );
}
