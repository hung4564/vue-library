import type { IDataset, MenuAction, MenuItemCommon } from '../../interfaces';
import { getMenuHandler } from './store';

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
  if (typeof click === 'function') {
    // Trường hợp: hàm trực tiếp
    click(layer, mapId, value);
  } else if (typeof click === 'string') {
    // Trường hợp: key string
    const handler = getMenuHandler(click);
    handler?.(layer, mapId, value);
  } else if (Array.isArray(click)) {
    for (const entry of click) {
      if (typeof entry === 'string') {
        // Trường hợp: entry là key string
        const handler = getMenuHandler(entry);
        handler?.(layer, mapId, value);
      } else if (Array.isArray(entry) && typeof entry[0] === 'string') {
        // entry là tuple [key, transformer]
        const [key, transformer] = entry;

        let result: [T, string, any] | undefined;

        if (Array.isArray(transformer)) {
          // transformer là tuple sẵn [layer, mapId, value]
          result = transformer as [T, string, any];
        } else if (typeof transformer === 'function') {
          // transformer là transformer function
          result = transformer(layer, mapId, value);
        }

        if (!result) {
          console.warn(
            `[handleMenuAction] result for key: ${key}`,
            layer,
            mapId,
            value,
          );
        } else {
          const [customLayer, customMapId, customValue] = result;
          const handler = getMenuHandler(key);
          if (handler) handler(customLayer, customMapId, customValue);
          else
            console.warn(`[handleMenuAction] No handler found for key: ${key}`);
        }
      } else {
        console.warn('[handleMenuAction] Invalid entry in click array:', entry);
      }
    }
  } else {
    console.warn('[onMenuAction] Invalid menu click handler:', click);
  }
}
