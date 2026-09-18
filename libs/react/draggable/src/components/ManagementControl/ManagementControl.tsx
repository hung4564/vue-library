import { useContainerId } from '../../context/ContainerContext';
import { useManagement } from '../../hook';
import { ShowStatusDragItem } from './ShowStatusDragItem';
import { ShowStatusDrawer } from './ShowStatusDrawer';
import { ShowStatusSideBar } from './ShowStatusSideBar';

export interface ManagementControlProps {
  containerId?: string;
}

const EMPTY_SIDEBAR = {
  left: { items: [] as string[], show: undefined as string | undefined },
  right: { items: [] as string[], show: undefined as string | undefined },
  top: { items: [] as string[], show: undefined as string | undefined },
  bottom: { items: [] as string[], show: undefined as string | undefined },
};

const EMPTY_DRAWER = {
  left: {
    items: [] as string[],
    size: 0,
    show: undefined as string | undefined,
  },
  right: {
    items: [] as string[],
    size: 0,
    show: undefined as string | undefined,
  },
  top: {
    items: [] as string[],
    size: 0,
    show: undefined as string | undefined,
  },
  bottom: {
    items: [] as string[],
    size: 0,
    show: undefined as string | undefined,
  },
};

const EMPTY_GROUP = { items: [] as string[], show: [] as string[] };
const EMPTY_BOTTOM = {
  items: [] as string[],
  show: undefined as string | undefined,
};

export function ManagementControl({
  containerId: propContainerId,
}: ManagementControlProps) {
  const containerId = useContainerId(propContainerId);
  const { width, height, popup, modal, float, bottom, sideBar, drawer } =
    useManagement(containerId);

  const sidebarMap = sideBar || EMPTY_SIDEBAR;
  const drawerMap = drawer || EMPTY_DRAWER;
  const popupGroup = popup || EMPTY_GROUP;
  const modalGroup = modal || EMPTY_GROUP;
  const floatGroup = float || EMPTY_GROUP;
  const bottomGroup = bottom || EMPTY_BOTTOM;

  const sidebarCount = Object.values(sidebarMap).reduce(
    (sum, side) => sum + (side?.items?.length || 0),
    0,
  );
  const drawerCount = Object.values(drawerMap).reduce(
    (sum, side) => sum + (side?.items?.length || 0),
    0,
  );

  return (
    <div className="mgmt">
      <section className="mgmt__section">
        <header className="mgmt__header">
          <h3 className="mgmt__title">Container</h3>
        </header>
        <div className="mgmt__metrics">
          <div className="mgmt__metric">
            <span className="mgmt__metric-label">Width</span>
            <span className="mgmt__metric-value">{width}</span>
          </div>
          <div className="mgmt__metric">
            <span className="mgmt__metric-label">Height</span>
            <span className="mgmt__metric-value">{height}</span>
          </div>
        </div>
      </section>

      {sidebarCount > 0 && (
        <section className="mgmt__section">
          <header className="mgmt__header">
            <h3 className="mgmt__title">Sidebars</h3>
            <span className="mgmt__count">{sidebarCount}</span>
          </header>
          <ShowStatusSideBar items={sidebarMap} containerId={containerId} />
        </section>
      )}

      {drawerCount > 0 && (
        <section className="mgmt__section">
          <header className="mgmt__header">
            <h3 className="mgmt__title">Drawers</h3>
            <span className="mgmt__count">{drawerCount}</span>
          </header>
          <ShowStatusDrawer items={drawerMap} containerId={containerId} />
        </section>
      )}

      {popupGroup.items.length > 0 && (
        <section className="mgmt__section">
          <header className="mgmt__header">
            <h3 className="mgmt__title">Popups</h3>
            <span className="mgmt__count">
              {popupGroup.show.length}/{popupGroup.items.length}
            </span>
          </header>
          <ShowStatusDragItem
            items={popupGroup.items}
            itemShows={popupGroup.show}
            containerId={containerId}
          />
        </section>
      )}

      {modalGroup.items.length > 0 && (
        <section className="mgmt__section">
          <header className="mgmt__header">
            <h3 className="mgmt__title">Modals</h3>
            <span className="mgmt__count">
              {modalGroup.show.length}/{modalGroup.items.length}
            </span>
          </header>
          <ShowStatusDragItem
            items={modalGroup.items}
            itemShows={modalGroup.show}
            containerId={containerId}
          />
        </section>
      )}

      {floatGroup.items.length > 0 && (
        <section className="mgmt__section">
          <header className="mgmt__header">
            <h3 className="mgmt__title">Floats</h3>
            <span className="mgmt__count">
              {floatGroup.show.length}/{floatGroup.items.length}
            </span>
          </header>
          <ShowStatusDragItem
            items={floatGroup.items}
            itemShows={floatGroup.show}
            containerId={containerId}
          />
        </section>
      )}

      {bottomGroup.items.length > 0 && (
        <section className="mgmt__section">
          <header className="mgmt__header">
            <h3 className="mgmt__title">Bottoms</h3>
            <span className="mgmt__count">
              {bottomGroup.show ? 1 : 0}/{bottomGroup.items.length}
            </span>
          </header>
          <ShowStatusDragItem
            items={bottomGroup.items}
            itemShows={bottomGroup.show ? [bottomGroup.show] : []}
            containerId={containerId}
          />
        </section>
      )}
    </div>
  );
}
