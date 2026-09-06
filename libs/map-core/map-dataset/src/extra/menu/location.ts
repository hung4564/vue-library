import type { MenuAction, MenuActionLocation } from '../../interfaces';

/** Location on a menu item, if present. */
export function getMenuItemLocation(
  item: MenuAction,
): MenuActionLocation | undefined {
  return item.type === 'item' && 'location' in item ? item.location : undefined;
}

/** Resolve location from host prop or menu item (default `extra`). */
export function resolveMenuItemLocation(
  item: MenuAction,
  location?: MenuActionLocation,
): MenuActionLocation {
  return location ?? getMenuItemLocation(item) ?? 'extra';
}
