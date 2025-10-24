import { loggerFactory } from '@hungpvq/shared-log';
import type { IDataset, MenuAction, MenuItemCommon } from '../../interfaces';
import { UniversalRegistry } from '../../registry';
import { type createMenuClickBuilder, createMenuProps } from './builder';
import type {
  CommandHandlerMenu,
  CommandHandlerMenuExecute,
  MenuItemClick,
  MenuItemClickCommon,
  MenuItemHandle,
  MenuItemProps,
} from './types';

export function handleMenuAction(menu: MenuAction, props: MenuItemProps) {
  if (menu.type !== 'item') return;

  const click = (menu as MenuItemCommon).click;

  handleMenuActionClick(click, props);
}
const MAX_DEPTH = 5;
const logger = loggerFactory.createLogger().setNamespace('menu');
function logHelper(
  logger: ReturnType<typeof loggerFactory.createLogger>,
  ...namespaces: (string | number)[]
) {
  namespaces.forEach((namespace, i) => {
    logger.setNamespace(namespace + '', 2 + i);
  });
  return logger;
}

export function createCommandHandler(
  canHandle: CommandHandlerMenu['canHandle'],
  execute: CommandHandlerMenu['execute'],
): CommandHandlerMenu {
  return { canHandle, execute };
}

/** Xử lý string action */
export const StringCommandHandler = createCommandHandler(
  (click): click is string => typeof click === 'string',
  async (click, context) => {
    const handler = UniversalRegistry.getMenuHandler(click, context.mapId);
    if (!handler) {
      throw new Error(
        `[handleMenuActionClick] No handler found for key: ${click}`,
      );
    }
    await handler(context);
  },
);

export const FunctionCommandHandler = createCommandHandler(
  (click): click is (props: MenuItemProps) => any =>
    typeof click === 'function',
  async (click, context) => {
    return await click(context);
  },
);

export const BuilderCommandHandler = createCommandHandler(
  (click): click is ReturnType<typeof createMenuClickBuilder> =>
    click != null && typeof (click as any).build === 'function',
  async (click, context) => {
    const builtClick = (
      click as ReturnType<typeof createMenuClickBuilder>
    ).build();
    await handleMenuActionClick(builtClick, context);
  },
);

export const TupleCommandHandler = createCommandHandler(
  (
    entry,
  ): entry is [
    MenuItemClickCommon,
    MenuItemHandle<any, any> | Partial<MenuItemProps>,
  ] => Array.isArray(entry) && entry.length == 2,
  async ([key, transformer], context) => {
    let props: MenuItemProps<any, any> = context;
    if (typeof transformer === 'function') {
      const result = await transformer(context);
      props = createMenuProps(context, result);
    } else if (transformer) {
      props = createMenuProps(context, transformer);
    }
    const commandHandlers: CommandHandlerMenu[] = [
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
  },
);
export const DirectCommandHandler = createCommandHandler(
  (click): click is CommandHandlerMenuExecute =>
    click != null && typeof (click as any).execute === 'function',
  async (entry, context) => {
    return entry.execute(entry, context);
  },
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
export async function handleMenuActionClick<P = any, T = IDataset>(
  action: MenuItemClick<P, T>,
  context: MenuItemProps<P, T>,
  depth = 0,
) {
  if (!action) return;
  if (depth > MAX_DEPTH) {
    console.warn('[handleMenuActionClick] Max recursion depth reached.');
    return;
  }

  const actions = Array.isArray(action) ? action : [action];

  const commandHandlers: CommandHandlerMenu[] = [
    BuilderCommandHandler,
    StringCommandHandler,
    FunctionCommandHandler,
    TupleCommandHandler,
    DirectCommandHandler,
  ];
  for (const [index, entry] of actions.entries()) {
    logHelper(logger, 'handleMenuActionClick', depth).debug(
      'Executing function action',
      entry,
    );
    let handled = false;

    for (const handler of commandHandlers) {
      if (handler.canHandle(entry)) {
        logHelper(logger, 'handleMenuActionClick', depth, index).debug(
          `Context`,
          {
            context,
            handler,
          },
        );
        const result = await handler.execute(entry, context);
        logHelper(logger, 'handleMenuActionClick', depth, index).debug(
          `Handler executed`,
          {
            handler: handler.constructor.name,
            entry,
          },
        );

        const nextAction = await resolveActionResult(result);

        if (nextAction) {
          logHelper(logger, 'handleMenuActionClick', depth, index).debug(
            `Recursing with next action`,
            {
              nextAction,
              depth: depth + 1,
            },
          );
          await handleMenuActionClick(nextAction, context, depth + 1);
        }

        handled = true;
        break;
      }
    }

    if (!handled) {
      console.warn('[handleMenuActionClick] Unknown entry:', entry);
    }
  }
}
