import { mdiTable } from '@mdi/js';
import { hasGeojsonExportData } from '../geo-export/dataset';
import type {
  IDataset,
  MenuConditionContext,
  MenuItemBottomOrExtra,
} from '../interfaces';
import {
  createMenuBuilder,
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
} from '../menu/builder';
import {
  LIST_VIEW_MENU_COMPONENT_KEY,
  LIST_VIEW_MENU_ID,
} from '../menu/items';
import type { AttributeTableExportOptions } from './export-options';
import type { AttributeTableColumnsOption } from './model';
import type { AttributeTableRowFilter, AttributeTableUiOptions } from './props';
import type { AttributeTableStore } from './store';
import {
  resolveAttributeTableExportOption,
  resolveAttributeTableUiOption,
} from './dataset-part';

export type AttributeTableMenuOptions = Partial<
  Omit<MenuItemBottomOrExtra<IDataset>, 'click' | 'location'>
> & {
  columns?: AttributeTableColumnsOption;
  store?: AttributeTableStore;
  ui?: AttributeTableUiOptions;
  rowFilter?: AttributeTableRowFilter;
  export?: AttributeTableExportOptions;
};

export function createMenuItemAttributeTable(
  menu: AttributeTableMenuOptions = {},
) {
  const { columns, store, ui, rowFilter, export: exportOpts, ...rest } = menu;
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
                export: resolveAttributeTableExportOption(layer, exportOpts),
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
  const config = (
    ctx.layer as { config?: { disabled_attribute_table?: boolean } }
  )?.config;
  if (extra.disabledAttributeTable || config?.disabled_attribute_table) {
    return true;
  }
  return !hasGeojsonExportData(ctx.layer);
}
