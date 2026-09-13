import type {
  MenuAction,
  MenuActionLocation,
  MenuByControl,
  MenuConditionContext,
  MenuControlId,
  MenuControlPlacement,
} from '../interfaces';

/** Injected as `menuContext.control` / `context.control` by dataset UI hosts. */
export const MENU_CONTROL_ID = {
  layerControl: 'layer-control',
  layerDetail: 'layer-detail',
  identify: 'identify',
  attributeTable: 'attribute-table',
} as const satisfies Record<string, MenuControlId>;

export type { MenuByControl, MenuControlId, MenuControlPlacement };

function readByControl(menu: MenuAction): MenuByControl | undefined {
  return 'byControl' in menu ? menu.byControl : undefined;
}

function readLocation(menu: MenuAction): MenuActionLocation | undefined {
  return menu.type === 'item' && 'location' in menu ? menu.location : undefined;
}

/**
 * Apply `byControl[context.control]` overrides (location / hidden) for the
 * current host. No-op when `context.control` is missing or unlisted.
 */
export function applyMenuControlPlacement(
  menu: MenuAction,
  ctx?: MenuConditionContext,
): MenuAction {
  const control = ctx?.context?.control;
  if (typeof control !== 'string') return menu;

  const byControl = readByControl(menu);
  const placement = byControl?.[control];
  if (!placement) return menu;

  const next: MenuAction = { ...menu };
  if (placement.location !== undefined) {
    (next as MenuAction & { location?: MenuActionLocation }).location =
      placement.location;
  }
  if (placement.hidden !== undefined) {
    (next as MenuAction & { hidden?: boolean }).hidden = placement.hidden;
  }
  return next;
}

/** Read effective location after control placement (default `extra`). */
export function getEffectiveMenuItemLocation(
  menu: MenuAction,
  ctx?: MenuConditionContext,
): MenuActionLocation {
  return readLocation(applyMenuControlPlacement(menu, ctx)) ?? 'extra';
}
