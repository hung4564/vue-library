import { useIcon } from '../../hook';
import { useDragContainer } from '../../store';
import { MapButton } from '../parts/MapButton';
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
              <MapButton onClick={() => onHighLight(item)} title="Highlight">
                <HighlightIcon size={16} />
              </MapButton>
            )}
            {!show ? (
              <MapButton onClick={() => onOpen(item)} title="Show">
                <ShowIcon size={16} />
              </MapButton>
            ) : (
              <MapButton onClick={() => onClose(item)} title="Hide">
                <HideIcon size={16} />
              </MapButton>
            )}
          </>
        )}
      />
    </div>
  );
}
