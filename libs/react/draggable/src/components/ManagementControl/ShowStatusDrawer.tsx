import { useIcon } from '../../hook';
import { useDragContainer } from '../../store';
import { DrawerConfig, LocationSideBar } from '../../types';
import { MapButton } from '../parts/MapButton';
import { ItemList } from './ItemList';

export interface ShowStatusDrawerProps {
  items: Record<LocationSideBar, DrawerConfig>;
  containerId: string;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function ShowStatusDrawer({
  items,
  containerId,
}: ShowStatusDrawerProps) {
  const { ShowIcon, HideIcon } = useIcon();
  const { getItemAction } = useDragContainer(containerId);

  function onOpen(id: string) {
    getItemAction(id)?.open?.();
  }
  function onClose(id: string) {
    getItemAction(id)?.close?.();
  }

  const filled = (
    Object.entries(items) as [LocationSideBar, DrawerConfig][]
  ).filter(([, state]) => (state?.items?.length || 0) > 0);

  if (!filled.length) return null;

  return (
    <div className="mgmt-groups">
      {filled.map(([side, state]) => (
        <div key={side} className="mgmt-group">
          <div className="mgmt-group__title">
            <span>{capitalize(side)}</span>
            <span className="mgmt__count">{(state.items || []).length}</span>
            {state.size ? (
              <span className="mgmt-group__meta">
                {Math.round(state.size)}px
              </span>
            ) : null}
          </div>
          <ItemList
            items={state.items || []}
            show={state.show}
            containerId={containerId}
            renderExtra={(item, show) =>
              !show ? (
                <MapButton onClick={() => onOpen(item)} title="Show">
                  <ShowIcon size={16} />
                </MapButton>
              ) : (
                <MapButton onClick={() => onClose(item)} title="Hide">
                  <HideIcon size={16} />
                </MapButton>
              )
            }
          />
        </div>
      ))}
    </div>
  );
}
