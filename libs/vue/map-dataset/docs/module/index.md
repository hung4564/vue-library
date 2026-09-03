# Components

Map controls (shared map props: `mapId`, `dragId`, `btnWidth`, `position`, `controlVisible`).

| Component | Role | Custom events |
| --- | --- | --- |
| [LayerControl](./LayerControl.md) | Editable layer list | none (list node: `toggleShow`, `changeOpacity`) |
| [LayerInfoControl](./LayerInfoControl.md) | Read-only list | none |
| [IdentifyControl](./IdentifyControl.md) | Click / box identify | none |
| [IdentifyShowFirstControl](./IdentifyShowFirstControl.md) | Click → first identify menu | none |
| [DatasetControl](./DatasetControl.md) | Root dataset list | none |
| [ComponentManagementControl](./ComponentManagementControl.md) | Dialogs from menus (`addComponent`) | none |
| [LayerHighlight](./LayerHighlight.md) | Click / hover highlight | none |
| [CreateControl](./CreateControl.md) | Create-layer dialog | Vue `update:show` / React `onShowChange` |

## Helpers

- [GIS worker](../worker.md) — Vite / Nx config for parse + CRS off the main thread
- [Legend](./Legend.md) — `createLegend` / `createMultiLegend`
- [LayerSimpleMapboxBuild](./LayerSimpleMapboxBuild.md)
- [useMapDataset](../helper/useMapDataset.md)
- [Create dataset](../create-dataset/)
- [Menus](../create-dataset/with-helper-menu.md)
- [Events](../create-dataset/with-helper-event.md)
- [Export](../create-dataset/export.md)
- [Attribute table](../create-dataset/attribute-table.md)
- [Quick dataset creation](../helper/QuickDatasetCreation.md)
- [Traverse](../helper/traverse.md)
