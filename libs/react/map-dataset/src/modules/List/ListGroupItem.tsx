import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import { useState } from 'react';
import { ListItem } from './ListItem';

export function ListGroupItem({
  item,
  children,
  disabledDrag,
}: {
  item: { name: string; children?: unknown[] };
  children?: React.ReactNode;
  disabledDrag?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <ListItem disabledDrag={disabledDrag}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1 }}>{item.name}</span>
        <button type="button" onClick={() => setOpen(!open)}>
          <Icon path={open ? mdiChevronDown : mdiChevronUp} size={0.6} />
        </button>
      </div>
      {open && children}
    </ListItem>
  );
}
