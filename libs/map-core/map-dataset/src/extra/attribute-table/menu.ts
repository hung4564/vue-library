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
import { LIST_VIEW_MENU_ID } from '../menu/items';
import { hasGeojsonExportData } from '../geo-export/dataset';
import { ATTRIBUTE_TABLE_COMPONENT_KEY } from './model';

export type AttributeTableMenuOptions = Partial<
  Omit<MenuItemBottomOrExtra<IDataset>, 'click' | 'location'>
>;

export function createMenuItemAttributeTable(
  menu: AttributeTableMenuOptions = {},
) {
  return createMenuBuilder()
    .item()
    .setLocation('menu')
    .setId(LIST_VIEW_MENU_ID.attributeTable)
    .setName('Attribute table')
    .setIcon(mdiTable)
    .setHidden((ctx) => isAttributeTableMenuHidden(ctx))
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic('addComponent', ({ layer, mapId }) => ({
          value: createMenuClickAddComponentBuilder()
            .setComponentKey(ATTRIBUTE_TABLE_COMPONENT_KEY)
            .setAttr({ layer, mapId })
            .setCheck(`${ATTRIBUTE_TABLE_COMPONENT_KEY}:${layer.id}`)
            .build(),
        }))
        .build(),
    )
    .setAdditional({
      order: 24,
      ...menu,
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
