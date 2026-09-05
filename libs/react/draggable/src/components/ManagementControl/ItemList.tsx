import { ReactNode } from 'react';
import { Item } from './Item';

export interface ItemListProps {
  items: string[];
  show?: string;
  containerId: string;
  itemShows?: string[];
  onClickItem?: (id: string) => void;
  renderExtra?: (item: string, show: boolean) => ReactNode;
}

export function ItemList({
  items,
  show,
  containerId,
  itemShows,
  onClickItem,
  renderExtra,
}: ItemListProps) {
  if (!items.length) {
    return <p className="mgmt__empty">Empty</p>;
  }

  return (
    <ul className="mgmt-list">
      {items.map((item) => {
        const isShow = show === item || !!itemShows?.includes(item);
        return (
          <li
            key={item}
            className={['mgmt-row', isShow ? 'mgmt-row--active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onClickItem?.(item)}
          >
            <div className="mgmt-row__label">
              <Item item={item} containerId={containerId} />
            </div>
            <div className="mgmt-row__status">
              <span
                className={['mgmt-dot', isShow ? 'mgmt-dot--on' : '']
                  .filter(Boolean)
                  .join(' ')}
              />
            </div>
            <div className="mgmt-row__actions">{renderExtra?.(item, isShow)}</div>
          </li>
        );
      })}
    </ul>
  );
}
