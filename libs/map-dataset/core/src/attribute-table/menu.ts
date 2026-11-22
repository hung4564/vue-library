import { mdiTable } from '@mdi/js';

import { hasGeojsonExportData } from '../geo-export/dataset';
import type { IDataset } from '../interfaces/dataset.base';
import type {
  MenuConditionContext,
  MenuItemBottomOrExtra,
} from '../interfaces/dataset.parts';
import {
  createMenuBuilder,
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
} from '../menu/builder';
import { LIST_VIEW_MENU_COMPONENT_KEY, LIST_VIEW_MENU_ID } from '../menu/items';
import { resolveAttributeTableUiOption } from './dataset-part';
import type { AttributeTableColumnsOption } from './model';
import type { AttributeTableRowFilter, AttributeTableUiOptions } from './props';
import type { AttributeTableStore } from './store';

export type AttributeTableMenuOptions = Partial<
  Omit<MenuItemBottomOrExtra<IDataset>, 'click' | 'location'>
> & {
  columns?: AttributeTableColumnsOption;
  store?: AttributeTableStore;
  ui?: AttributeTableUiOptions;
  rowFilter?: AttributeTableRowFilter;
};

export function createMenuItemAttributeTable(
  menu: AttributeTableMenuOptions = {},
) {
  const { columns, store, ui, rowFilter, ...rest } = menu;
  return createMenuBuilder()
    .item()
    .setLocation('menu')
    .setId(LIST_VIEW_MENU_ID.layer.attributeTable)
    .setName('Attribute table')
    .setIcon(mdiTable)
    .setHidden((ctx) => isAttributeTableMenuHidden(ctx))
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic(
          LIST_VIEW_MENU_ID.addComponent,
          ({ layer, mapId }) => ({
            value: createMenuClickAddComponentBuilder()
              .setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.attributeTable)
              .setAttr({
                layer,
                mapId,
                columns,
                store,
                ui: resolveAttributeTableUiOption(layer, ui),
                rowFilter,
              })
              .setCheck(
                `${LIST_VIEW_MENU_COMPONENT_KEY.attributeTable}:${layer.id}`,
              )
              .build(),
          }),
        )
        .build(),
    )
    .setAdditional({
      order: 24,
      ...rest,
    })
    .build();
}

export function isAttributeTableMenuHidden(ctx: MenuConditionContext): boolean {
  const extra = (ctx.context ?? {}) as { disabledAttributeTable?: boolean };
  if (extra.disabledAttributeTable) return true;
  return !hasGeojsonExportData(ctx.layer);
}
