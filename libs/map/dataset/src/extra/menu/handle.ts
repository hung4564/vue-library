import type { IDataset, MenuAction, MenuItemCommon } from '../../interfaces';
import { UniversalRegistry } from '../../registry';

export function handleMenuAction<T extends IDataset = IDataset>(
  menu: MenuAction<T>,
  layer: T,
  mapId: string,
  value: any,
) {
  if (menu.type !== 'item') return;

  const click = (menu as MenuItemCommon<T>).click;

  handleMenuActionClick(click, layer, mapId, value);
}

export function handleMenuActionClick<T extends IDataset = IDataset>(
  click: MenuItemCommon<T>['click'],
  layer: T,
  mapId: string,
  value: any,
) {
  if (!click) {
    return;
  }
  if (typeof click === 'function') {
    click(layer, mapId, value);
    return;
  }

  // Trường hợp click là string key
  if (typeof click === 'string') {
    const handler = UniversalRegistry.getMenuHandler(click, mapId);
    if (!handler)
      throw new Error(
        `[handleMenuActionClick] No handler found for key: ${click}`,
      );
    handler(layer, mapId, value);
    return;
  }

  if (Array.isArray(click)) {
    for (const entry of click) {
      if (typeof entry === 'string') {
        const handler = UniversalRegistry.getMenuHandler(entry, mapId);
        if (!handler)
          throw new Error(
            `[handleMenuActionClick] No handler found for key: ${entry}`,
          );
        handler(layer, mapId, value);
        continue;
      }

      if (!Array.isArray(entry) || typeof entry[0] !== 'string') {
        throw new Error(
          '[handleMenuActionClick] Invalid entry in click array: ' +
            JSON.stringify(entry),
        );
      }

      const [key, transformer] = entry;

      let result: [T, string, any] | undefined;

      if (Array.isArray(transformer)) {
        if (transformer.length !== 3) {
          throw new Error(
            `[handleMenuActionClick] Transformer tuple must have 3 elements [T, string, any] for key: ${key}`,
          );
        }
        result = transformer as [T, string, any];
      } else if (typeof transformer === 'function') {
        result = transformer(layer, mapId, value);
      } else {
        throw new Error(
          `[handleMenuActionClick] Invalid transformer for key: ${key}, must be tuple or function`,
        );
      }

      if (!result) {
        console.warn(
          `[handleMenuActionClick] Transformer returned undefined for key: ${key}`,
        );
        continue;
      }

      const [customLayer, customMapId, customValue] = result;
      const handler = UniversalRegistry.getMenuHandler(key, mapId);
      if (!handler)
        throw new Error(
          `[handleMenuActionClick] No handler found for key: ${key}`,
        );
      handler(customLayer, customMapId, customValue);
    }

    return;
  }

  // Nếu click không phải function, string hoặc array
  throw new Error(
    `[handleMenuActionClick] Invalid click type: ${typeof click}`,
  );
}
