import { mdiArrowUpDown } from '@mdi/js';
import Icon from '@mdi/react';

const ICON_SIZE = '14px';

export function ListItem({
  children,
  disabledDrag,
  isSelected,
  item,
  className = '',
}: {
  children: React.ReactNode;
  disabledDrag?: boolean;
  isSelected?: boolean;
  item?: { color?: string; id?: string; name?: string };
  className?: string;
}) {
  return (
    <div
      className={`draggale-item ${isSelected ? 'draggale-item-active' : ''} ${className}`.trim()}
    >
      {!disabledDrag && (
        <div className="draggable-handle" style={{ background: item?.color || '#1a73e8' }}>
          <div className="draggable-handle__icon">
            <Icon path={mdiArrowUpDown} size={ICON_SIZE} />
          </div>
        </div>
      )}
      <div className="draggale-item__info">{children}</div>
    </div>
  );
}
