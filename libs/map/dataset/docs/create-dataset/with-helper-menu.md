# Menu System in Dataset Components

## Overview

The Menu system allows you to define custom and built-in menu actions for dataset components, such as List UI or Identify. Menus provide users with contextual actions (e.g., show details, download, edit style) directly from the UI.

## Use Cases

- Adding custom actions to dataset items (e.g., download, export, custom dialogs)
- Integrating built-in actions (toggle visibility, show details, fit bounds, etc.)
- Creating complex action chains for advanced workflows

## Basic API

Each dataset component that supports menus provides the following methods:

```typescript
addMenu(menu: MenuAction<T>): void;
addMenus(menusToAdd: MenuAction<T>[]): void;
getMenus(): MenuAction<T>[];
removeMenu(id: string): void;
updateMenu(id: string, updater: (menu: MenuAction<T>) => MenuAction<T>): void;
getMenu(id: string): MenuAction<T> | undefined;
hasMenu(id: string): boolean;
```

## Adding a Custom Menu Item

```typescript
list.addMenu(
  createMenuItem({
    type: 'item',
    name: 'Download',
    icon: mdiDownload,
    click: async (layer, mapId) => {
      // Custom download logic
    },
  }),
);
```

## Adding a Built-in Menu Item

Built-in menu item creators include:

- `createMenuItemToggleShow`
- `createMenuItemShowDetailInfoSource`
- `createMenuItemShowDetailForItem`
- `createMenuItemToBoundActionForItem`
- `createMenuItemToBoundActionForList`
- `createMenuItemStyleEdit`
- `createMenuItemSetOpacity`

Example:

```typescript
list.addMenu(createMenuItemToggleShow());
```

## Menu Action Chains

Menu actions can be defined as a sequence of operations for advanced workflows:

```typescript
list.addMenu(
  createMenuItem({
    type: 'item',
    name: 'Edit style',
    icon: mdiFormatLineStyle,
    click: [
      [
        'addComponent',
        (layer, mapId) => [
          layer,
          mapId,
          {
            componentKey: 'style-control',
            attr: { item: layer },
          },
        ],
      ],
    ],
  }),
);
```

### Built-in Action Types

- `addComponent`: Open a custom component dialog
- `fitBounds`: Zoom to a feature or geometry
- `highlight`: Highlight a feature on the map

## Registering Custom Menu Handlers

You can register global menu handlers and components using the UniversalRegistry:

```typescript
UniversalRegistry.registerMenuHandlerForMap('custom-action', handlerFunction);
UniversalRegistry.registerComponent('legend-linear', LayerLegendLinearGradient);
```

---

## Handling Menu Actions: `handleMenuAction` and `handleMenuActionClick`

### `handleMenuAction`

This function is used to trigger the action associated with a menu item. It is typically called when a user clicks a menu item in the UI.

**Signature:**

```typescript
handleMenuAction(menu: MenuAction, layer: IDataset, mapId: string, value: any): void
```

- `menu`: The menu action object (from your menu definition)
- `layer`: The dataset or layer the menu is attached to
- `mapId`: The map instance ID
- `value`: Optional value to pass to the action

**Example (from a UI event handler):**

```typescript
import { handleMenuAction } from '@hungpvq/vue-map-dataset';

function onMenuClick(action, item, mapId) {
  handleMenuAction(action, item, mapId, item);
}
```

### `handleMenuActionClick`

This is a lower-level function that executes the `click` handler of a menu item. It is called internally by `handleMenuAction`, but can also be used directly if you want to trigger a menu action programmatically.

**Signature:**

```typescript
handleMenuActionClick(click, layer, mapId, value): void
```

- `click`: The click handler (function, string key, or array for action chains)
- `layer`: The dataset or layer
- `mapId`: The map instance ID
- `value`: Optional value

**Example:**

```typescript
import { handleMenuActionClick } from '@hungpvq/vue-map-dataset';

// Directly trigger a menu click handler
handleMenuActionClick(menu.click, layer, mapId, value);
```

**Typical usage in LayerControl:**

```typescript
function onLayerAction({ action, item }) {
  handleMenuAction(action, item, mapId, item);
}
```

---

## Best Practices

- Use descriptive names and icons for menu items
- Combine built-in and custom actions for a rich user experience
- Test menu actions for usability and performance
