import { mdiTable } from '@mdi/js';
import type {
  IDataset,
  MenuConditionContext,
  MenuItemBottomOrExtra,
} from '../../interfaces';
import {
  createMenuBuilder,
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
} from '../menu/builder';
import { LIST_VIEW_MENU_COMPONENT_KEY, LIST_VIEW_MENU_ID } from '../menu/items';
import { hasGeojsonExportData } from '../geo-export/dataset';
import type { AttributeTableColumnsOption } from './model';

export type AttributeTableMenuOptions = Partial<
  Omit<MenuItemBottomOrExtra<IDataset>, 'click' | 'location'>
> & {
  columns?: AttributeTableColumnsOption;
};

export function createMenuItemAttributeTable(
  menu: AttributeTableMenuOptions = {},
) {
  const { columns, ...rest } = menu;
  return createMenuBuilder()
    .item()
    .setLocation('menu')
    .setId(LIST_VIEW_MENU_ID.attributeTable)
    .setName('Attribute table')
    .setIcon(mdiTable)
    .setHidden((ctx) => isAttributeTableMenuHidden(ctx))
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic(LIST_VIEW_MENU_ID.addComponent, ({ layer, mapId }) => ({
          value: createMenuClickAddComponentBuilder()
            .setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.attributeTable)
            .setAttr({ layer, mapId, columns })
            .setCheck(
              `${LIST_VIEW_MENU_COMPONENT_KEY.attributeTable}:${layer.id}`,
            )
            .build(),
        }))
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
  const config = (
    ctx.layer as { config?: { disabled_attribute_table?: boolean } }
  )?.config;
  if (extra.disabledAttributeTable || config?.disabled_attribute_table) {
    return true;
  }
  return !hasGeojsonExportData(ctx.layer);
}
