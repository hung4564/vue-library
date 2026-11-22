import { LocationSideBar } from '../types';
import { DragDebugItem } from './inspect';
import { describeDragOrigin, formatDragOrigin } from './origin';

export function rowKey(row: DragDebugItem) {
  return `${row.containerId}::${row.id}`;
}

export function canMove(row: DragDebugItem) {
  return row.type === 'item-sidebar' || row.type === 'item-drawer';
}

export function canStack(row: DragDebugItem) {
  return (
    row.type === 'item-popup' ||
    row.type === 'item-float' ||
    row.type === 'item-modal'
  );
}
export function detailRows(row: DragDebugItem) {
  return [
    ['id', row.id],
    ['container', row.containerId],
    ['type', row.type],
    ['title', row.title || '—'],
    ['show', row.show ? 'yes' : 'no'],
    ['location', row.location || '—'],
    ['size', String(row.size ?? '—')],
    [
      'bounds',
      row.bounds
        ? `${row.bounds.x},${row.bounds.y} ${row.bounds.width}×${row.bounds.height}`
        : '—',
    ],
    ['created', describeDragOrigin(row.origin)],
    ['origin', formatDragOrigin(row.origin)],
    ['hook', row.origin?.hook || '—'],
    ['caller', row.origin?.caller || '—'],
  ] as const;
}

export const LOCATIONS: LocationSideBar[] = ['left', 'right', 'top', 'bottom'];
export const LOCATION_ITEMS = LOCATIONS.map((side) => ({
  value: side,
  text: side,
}));
