import { LIST_VIEW_MENU_COMPONENT_KEY } from './items';

/** Registry slots registered by Vue/React dataset plugins (stable order). */
export const DATASET_REGISTRY_SLOTS = [
  'legendLinear',
  'legendColor',
  'legendText',
  'legendMulti',
  'layerIcon',
  'layerDetail',
  'styleControl',
  'datasetDetail',
  'styleMultiControl',
  'toggleShow',
  'toggleShowButton',
  'setOpacity',
  'addToGroup',
  'exportGeo',
  'exportGeoMenu',
  'identify',
  'attributeTable',
  'attributeTableView',
  'attributeTableToolbar',
  'attributeTablePager',
  'attributeTableGrid',
] as const satisfies ReadonlyArray<keyof typeof LIST_VIEW_MENU_COMPONENT_KEY>;

export type DatasetRegistryComponentKey =
  (typeof DATASET_REGISTRY_SLOTS)[number];

export function resolveDatasetRegistryKey(
  slot: DatasetRegistryComponentKey,
): string {
  return LIST_VIEW_MENU_COMPONENT_KEY[slot];
}

/** Register framework dataset UI components into the map registry. */
export function registerDatasetRegistryComponents<TComponent>(
  registerComponent: (registryKey: string, component: TComponent) => void,
  components: Partial<Record<DatasetRegistryComponentKey, NoInfer<TComponent>>>,
): void {
  for (const slot of DATASET_REGISTRY_SLOTS) {
    const component = components[slot];
    if (component != null) {
      registerComponent(resolveDatasetRegistryKey(slot), component);
    }
  }
}
