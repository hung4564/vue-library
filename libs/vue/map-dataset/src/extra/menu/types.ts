import type { MapMouseEvent } from 'maplibre-gl';
import type { IDataset, MenuAction } from '../../interfaces';
import type { createMenuClickBuilder } from './builder';

export type CommandHandlerMenuExecute<PDefault = any, TDefault = IDataset> = {
  execute: <P = PDefault, T = TDefault>(
    click: any,
    baseProps: MenuItemProps<P, T>,
  ) =>
    | Promise<void | ReturnType<typeof createMenuClickBuilder<P, T>>>
    | void
    | ReturnType<typeof createMenuClickBuilder<P, T>>;
};
export type CommandHandlerMenu<
  PDefault = any,
  TDefault = IDataset,
> = CommandHandlerMenuExecute<PDefault, TDefault> & {
  canHandle: (click: unknown) => boolean;
};

export type MenuItemProps<P = any, T = IDataset> = {
  layer: T;
  mapId: string;
  value?: P;
  event?: MouseEvent | KeyboardEvent | MapMouseEvent;
  meta?: Record<string, unknown>;
  context?: {
    [key: string]: unknown;
  };
};
export type MenuItemHandleResult<P = any, T = IDataset> =
  | Partial<MenuItemProps<P, T>>
  | Promise<Partial<MenuItemProps<P, T>> | void>
  | void;
export type MenuItemHandle<P = any, T = IDataset> = (
  args: MenuItemProps<P, T>,
) => MenuItemHandleResult<P, T>;
export type MenuItemClickHandle<P = any, T = IDataset> = (
  args: MenuItemProps<P, T>,
) =>
  | ReturnType<typeof createMenuClickBuilder<P, T>>
  | Promise<ReturnType<typeof createMenuClickBuilder<P, T>>>
  | void
  | Promise<void>;
export type MenuItemClickCommon<P = any, T = IDataset> =
  | string
  | CommandHandlerMenuExecute<P, T>;
export type MenuItemClick<P = any, T = IDataset> =
  | MenuItemClickCommon<P, T>
  | MenuItemClickHandle<P, T>
  | Array<
      | MenuItemClickCommon<P, T>
      | [
          key: MenuItemClickCommon<P, T>,
          transformer?: Partial<MenuItemProps<P, T>> | MenuItemHandle<P, T>,
        ]
    >;

export interface WithMenuBuilder<T = IDataset> {
  addMenu(menu: MenuAction<T>): this;
  addMenus(menusToAdd: MenuAction<T>[]): this;
}
