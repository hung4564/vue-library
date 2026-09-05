import { useIcon } from '../../hook';
import { useDragContainer } from '../../store';
import { LocationSideBar, SidebarConfig } from '../../types';
import { MapButton } from '../parts/MapButton';
import { ItemList } from './ItemList';

export interface ShowStatusSideBarProps {
  items: Record<LocationSideBar, SidebarConfig>;
  containerId: string;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function ShowStatusSideBar({
  items,
  containerId,
}: ShowStatusSideBarProps) {
  const { ShowIcon } = useIcon();
  const { getItemAction } = useDragContainer(containerId);

  function onOpen(id: string) {
    getItemAction(id)?.open?.();
  }

  const filled = (
    Object.entries(items) as [LocationSideBar, SidebarConfig][]
  ).filter(([, state]) => (state?.items?.length || 0) > 0);

  if (!filled.length) return null;

  return (
    <div className="mgmt-groups">
      {filled.map(([side, state]) => (
        <div key={side} className="mgmt-group">
          <div className="mgmt-group__title">
            <span>{capitalize(side)}</span>
            <span className="mgmt__count">{state.items.length}</span>
          </div>
          <ItemList
            items={state.items}
            show={state.show}
            containerId={containerId}
            renderExtra={(item, show) =>
              !show ? (
                <MapButton onClick={() => onOpen(item)} title="Show">
                  <ShowIcon size={16} />
                </MapButton>
              ) : null
            }
          />
        </div>
      ))}
    </div>
  );
}
