import { logHelper, UniversalRegistry } from '@hungpvq/map-core';
import { loggerFactory, runWithFunctionLog } from '@hungpvq/shared-log';
import type { IDataset } from '../interfaces/dataset.base';
import type { MenuAction, MenuItemCommon } from '../interfaces/dataset.parts';
import { type createMenuClickBuilder, createMenuProps } from './builder';
import type {
  CommandHandlerMenu,
  CommandHandlerMenuExecute,
  MenuItemClick,
  MenuItemClickCommon,
  MenuItemClickHandle,
  MenuItemHandle,
  MenuItemProps,
} from './types';

const MAX_DEPTH = 5;
const logger = loggerFactory.createLogger().setNamespace('menu');

type NamedCommandHandler = CommandHandlerMenu & { name: string };

function describeMenuClick(entry: unknown): string {
  if (typeof entry === 'string') return `registry:${entry}`;
  if (typeof entry === 'function') return 'function';
  if (Array.isArray(entry)) {
    const head = describeMenuClick(entry[0]);
    return `tuple→${head}`;
  }
  if (entry != null && typeof entry === 'object') {
    if (typeof (entry as { build?: unknown }).build === 'function') {
      return 'builder';
    }
    if (typeof (entry as { execute?: unknown }).execute === 'function') {
      return 'command';
    }
  }
  return typeof entry;
}

function menuLogMeta(
  context: {
    mapId: string;
    layer?: unknown;
    context?: { [key: string]: unknown };
  },
  extra?: Record<string, unknown>,
) {
  const control =
    typeof context.context?.['control'] === 'string'
      ? context.context['control']
      : undefined;
  const layer = context.layer as
    | { id?: string; type?: string; name?: string }
    | undefined;
  return {
    control,
    datasetId: typeof layer?.id === 'string' ? layer.id : undefined,
    datasetType: typeof layer?.type === 'string' ? layer.type : undefined,
    datasetName: typeof layer?.name === 'string' ? layer.name : undefined,
    ...extra,
  };
}

function menuClickLog(
  context: { mapId: string },
  depth: number,
  index?: number,
) {
  const parts = [
    'handleMenuActionClick',
    String(depth),
    index != null ? String(index) : undefined,
  ].filter((x): x is string => x != null);
  return logHelper(logger, context.mapId, ...parts).with({
    fn: 'handleMenuActionClick',
    span: 'menu.action',
  });
}

export function handleMenuAction(menu: MenuAction, props: MenuItemProps) {
  if (menu.type !== 'item') {
    logHelper(logger, props.mapId, 'handleMenuAction')
      .with({ fn: 'handleMenuAction', span: 'menu.action', mapId: props.mapId })
      .debug('Menu action skipped because type is not item.', {
        menuType: menu.type,
      });
    return;
  }

  const click = (menu as MenuItemCommon).click;
  if (!click) {
    logHelper(logger, props.mapId, 'handleMenuAction')
      .with({ fn: 'handleMenuAction', span: 'menu.action', mapId: props.mapId })
      .debug('Menu action skipped because click handler is missing.', {
        menuId: typeof menu.id === 'string' ? menu.id : undefined,
      });
    return;
  }

  const control =
    typeof props.context?.['control'] === 'string'
      ? (props.context['control'] as string)
      : undefined;
  const menuId = typeof menu.id === 'string' ? menu.id : undefined;
  const menuName =
    'name' in menu && typeof menu.name === 'string' ? menu.name : undefined;
  const layer = props.layer as
    | { id?: string; type?: string; name?: string }
    | undefined;
  const datasetId = typeof layer?.id === 'string' ? layer.id : undefined;
  const datasetType = typeof layer?.type === 'string' ? layer.type : undefined;
  const datasetName = typeof layer?.name === 'string' ? layer.name : undefined;

  const menuLabel = menuName || menuId;
  const fn = menuLabel
    ? control
      ? `${control}/${menuLabel}`
      : menuLabel
    : control
      ? `${control}/menu`
      : 'handleMenuAction';

  return loggerFactory.ensureActionContext(
    {
      mapId: props.mapId,
      span: 'menu.action',
      control,
      menuId,
      menuName,
      datasetId,
      datasetName,
      datasetType,
      fn,
    },
    () =>
      runWithFunctionLog(
        logHelper(logger, props.mapId, 'handleMenuAction'),
        {
          fn,
          span: 'menu.action',
          mapId: props.mapId,
          control,
          menuId,
          menuName,
          datasetId,
          datasetName,
          datasetType,
        },
        () => handleMenuActionClick(click, props),
      ),
  );
}

export function createCommandHandler(
  canHandle: CommandHandlerMenu['canHandle'],
  execute: CommandHandlerMenu['execute'],
  name = 'custom',
): NamedCommandHandler {
  return { name, canHandle, execute };
}

/** Xử lý string action → UniversalRegistry (map-scoped rồi global) */
export const StringCommandHandler = createCommandHandler(
  (click): click is string => typeof click === 'string',
  async (click, context) => {
    const key = click as string;
    const handler = UniversalRegistry.getMenuHandler(key, context.mapId);
    if (!handler) {
      logHelper(logger, context.mapId, 'handleMenuActionClick')
        .with({ fn: 'StringCommandHandler', span: 'menu.action' })
        .warn(
          `Menu registry lookup failed: no handler registered for key "${key}".`,
          menuLogMeta(context, { click: key, menuId: key }),
        );
      return;
    }
    await handler(context);
  },
  'string',
);

export const FunctionCommandHandler = createCommandHandler(
  (click): click is MenuItemClickHandle => typeof click === 'function',
  (async (click, context) => {
    const result = await (click as MenuItemClickHandle)(
      context as MenuItemProps,
    );
    if (isMenuClickBuilder(result)) return result;
    return undefined;
  }) as CommandHandlerMenu['execute'],
  'function',
);

export const BuilderCommandHandler = createCommandHandler(
  (click): click is ReturnType<typeof createMenuClickBuilder> =>
    click != null && typeof (click as { build?: unknown }).build === 'function',
  async (click, context) => {
    const builtClick = (
      click as ReturnType<typeof createMenuClickBuilder>
    ).build();
    await handleMenuActionClick(builtClick, context, 1);
  },
  'builder',
);

export const TupleCommandHandler = createCommandHandler(
  (
    entry,
  ): entry is [MenuItemClickCommon, MenuItemHandle | Partial<MenuItemProps>] =>
    Array.isArray(entry) && entry.length == 2,
  (async (entry, context) => {
    const [key, transformer] = entry as [
      MenuItemClickCommon,
      MenuItemHandle | Partial<MenuItemProps>,
    ];
    let props: MenuItemProps = context as MenuItemProps;
    if (typeof transformer === 'function') {
      const result = await transformer(context as MenuItemProps);
      props = createMenuProps(
        context as MenuItemProps,
        (result ?? undefined) as Partial<MenuItemProps> | undefined,
      );
    } else if (transformer) {
      props = createMenuProps(context as MenuItemProps, transformer);
    }
    const commandHandlers: NamedCommandHandler[] = [
      BuilderCommandHandler,
      StringCommandHandler,
      FunctionCommandHandler,
      TupleCommandHandler,
      DirectCommandHandler,
    ];

    for (const handler of commandHandlers) {
      if (handler.canHandle(key)) {
        return handler.execute(key, props);
      }
    }
  }) as CommandHandlerMenu['execute'],
  'tuple',
);
export const DirectCommandHandler = createCommandHandler(
  (click): click is CommandHandlerMenuExecute =>
    click != null &&
    typeof (click as CommandHandlerMenuExecute).execute === 'function',
  async (entry, context) => {
    const cmd = entry as CommandHandlerMenuExecute;
    return cmd.execute(cmd, context);
  },
  'command',
);

/** Helper kiểm tra builder */
function isMenuClickBuilder<P, T>(
  val: any,
): val is ReturnType<typeof createMenuClickBuilder<P, T>> {
  return val != null && typeof val.build === 'function';
}

/** Helper normalize kết quả action */
async function resolveActionResult<P, T>(
  result: any,
): Promise<MenuItemClick<P, T> | void> {
  if (isMenuClickBuilder(result)) return result.build();
  return undefined;
}

/** Hàm chính handleMenuActionClick */
export async function handleMenuActionClick<P = unknown, T = IDataset>(
  action: MenuItemClick<P, T>,
  context: MenuItemProps<P, T>,
  depth = 0,
) {
  const run = async () => {
    if (!action) return;
    if (depth > MAX_DEPTH) {
      menuClickLog(context, depth).warn(
        'Menu click aborted because nesting exceeded max depth.',
        menuLogMeta(context, { depth, maxDepth: MAX_DEPTH }),
      );
      return;
    }

    const actions = Array.isArray(action) ? action : [action];

    const commandHandlers: NamedCommandHandler[] = [
      BuilderCommandHandler,
      StringCommandHandler,
      FunctionCommandHandler,
      TupleCommandHandler,
      DirectCommandHandler,
    ];
    for (const [index, entry] of actions.entries()) {
      const clickKind = describeMenuClick(entry);
      menuClickLog(context, depth, index).debug(
        `Dispatching menu click entry #${index} at depth ${depth} (${clickKind}).`,
        menuLogMeta(context, { clickKind }),
      );
      let handled = false;

      for (const handler of commandHandlers) {
        if (handler.canHandle(entry)) {
          menuClickLog(context, depth, index).debug(
            `Running menu command handler "${handler.name}" for ${clickKind}.`,
            menuLogMeta(context, {
              handler: handler.name,
              clickKind,
            }),
          );
          let result: unknown;
          try {
            result = await handler.execute(entry, context);
          } catch (err) {
            menuClickLog(context, depth, index).error(
              `Menu command handler "${handler.name}" failed for ${clickKind}.`,
              menuLogMeta(context, {
                handler: handler.name,
                clickKind,
                errorName: err instanceof Error ? err.name : undefined,
                errorMessage:
                  err instanceof Error ? err.message : String(err),
              }),
            );
            throw err;
          }

          menuClickLog(context, depth, index).debug(
            `Menu command handler "${handler.name}" finished for ${clickKind}.`,
            menuLogMeta(context, {
              handler: handler.name,
              clickKind,
            }),
          );

          const nextAction = await resolveActionResult(result);

          if (nextAction) {
            menuClickLog(context, depth, index).debug(
              `Chaining nested menu click at depth ${depth + 1} (${describeMenuClick(nextAction)}).`,
              menuLogMeta(context, {
                handler: handler.name,
                nextKind: describeMenuClick(nextAction),
                depth: depth + 1,
              }),
            );
            await handleMenuActionClick(nextAction, context, depth + 1);
          }

          handled = true;
          break;
        }
      }

      if (!handled) {
        menuClickLog(context, depth, index).warn(
          `Menu click entry skipped because no command handler matched (${clickKind}).`,
          menuLogMeta(context, { clickKind }),
        );
      }
    }
  };

  return run();
}
