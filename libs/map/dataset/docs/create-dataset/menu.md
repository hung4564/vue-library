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

## Best Practices

- Use descriptive names and icons for menu items
- Combine built-in and custom actions for a rich user experience
- Test menu actions for usability and performance
