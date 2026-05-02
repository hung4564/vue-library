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
handleMenuAction(menu: MenuAction, {layer: IDataset, mapId: string, value: any}): void
```

- `menu`: The menu action object (from your menu definition)
- `layer`: The dataset or layer the menu is attached to
- `mapId`: The map instance ID
- `value`: Optional value to pass to the action

**Example (from a UI event handler):**

```typescript
import { handleMenuAction } from '@hungpvq/vue-map-dataset';

function onMenuClick(action, item, mapId) {
  handleMenuAction(action, { layer: item, mapId, value: item });
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
  handleMenuAction(action, { layer: item, mapId, value: item });
}
```

---

## Best Practices

- Use descriptive names and icons for menu items
- Combine built-in and custom actions for a rich user experience
- Test menu actions for usability and performance

---

## Using `createMenuBuilder` for Flexible Menu Creation

### Overview

`createMenuBuilder` is a utility for programmatically building menu actions (`MenuAction`) with a clear, composable API. It is especially useful for advanced or dynamic menu setups, action chains, and when multiple menu configurations need to be created in code.

### Basic API

```typescript
const builder = createMenuBuilder();
const menuItem = builder
  .item()
  .setId('custom-action')
  .setName('Download')
  .setIcon(mdiDownload)
  .setLocation('menu') // 'menu' | 'bottom' | 'extra' | 'prebottom'
  .setClick((layer, mapId) => {
    // Custom download logic
  })
  .build();

list.addMenu(menuItem);
```

#### API Methods (for `.item()`)

- `setId(id: string)`: Unique ID for updating/removing the menu.
- `setName(name: string)`: Displayed label.
- `setIcon(icon: string)`: Icon as SVG path or name.
- `setLocation(loc: 'menu' | 'bottom' | 'extra' | 'prebottom')`: Where the menu appears.
- `setClick(click)`: Handler function or command/action-chain.
- `setComponentKey(key: string)`: Use a custom menu component.
- `setAdditional(obj)`: Attach any extra props to the action object.
- `build()`: Returns the menu object.

#### Divider

Add visual dividers between menu items:

```typescript
const divider = createMenuBuilder().divider().setLocation('menu').build();
list.addMenu(divider);
```

### Advanced Example: Action Chains

Create chained actions for advanced workflows using `createMenuClickBuilder`:

```typescript
import { createMenuBuilder, createMenuClickBuilder } from '@hungpvq/vue-map-dataset';

const chainMenu = createMenuBuilder()
  .item()
  .setName('Detail & Zoom')
  .setIcon(mdiInformation)
  .setClick(
    createMenuClickBuilder()
      .addTupleStatic('addComponent', { layer, mapId, value: { componentKey: 'detail-dialog', attr: { item: layer } } })
      .addTupleStatic('fitBounds', { layer, mapId, value: {} })
      .build(),
  )
  .build();

list.addMenu(chainMenu);
```

### Tips

- Combine with `createMenuClickBuilder` for multi-step or conditional actions.
- Use `addMenus([ ... ])` to add several menu items at once after building them programmatically.

### When to Use

- When menu complexity goes beyond a static object definition.
- For shared menu patterns or mass customization in dynamic dataset UIs.

See the earlier sections for integration with UI and menu registration.

### Using `createMenuClickBuilder` for Advanced Action Chains

`createMenuClickBuilder` allows you to compose complex menu action chains that can trigger multiple commands, custom handlers, or tuple-based actions in sequence when a menu item is selected. This is powerful for workflows involving dialogs, side effects, and chained map interactions.

#### Basic Usage

```typescript
import { createMenuClickBuilder } from '@hungpvq/vue-map-dataset';

const menuClick = createMenuClickBuilder()
  .addCommand('showDetail') // Add a command string (must be globally handled)
  .addCommand(({ layer, mapId, value }) => {
    // Add a direct handler function
    // Custom logic here
  })
  .addTupleStatic('addComponent', { layer, mapId, value: { componentKey: 'dialog', attr: { item: layer } } }) // Add a tuple [key, static args]
  .addTupleDynamic('fitBounds', ({ layer, mapId, value }) => ({ layer, mapId, value })) // Add a tuple with dynamic argument
  .build();
```

#### Available Methods

- `.addCommand(cmd: string)`: Add a named command (resolved by UniversalRegistry handler).
- `.addCommand(fn)`: Add a direct handler (function signature: `({layer, mapId, value})`).
- `.addCommands(cmds: string[])`: Add multiple commands (all will be executed).
- `.addTupleStatic(key: string, tuple: MenuItemProps)`: Add a tuple-action with static parameters (shortcut for common chained UI actions).
- `.addTupleDynamic(key: string, fn)`: Add a tuple-action where arguments are computed at runtime by a function.
- `.build()`: Compile the builder into a single `MenuItemClick` handler (function, string, or array depending on complexity).

#### Example: Complex Action Chain

```typescript
const complexClick = createMenuClickBuilder()
  .addTupleStatic('addComponent', { value: { componentKey: 'analysis-dialog', attr: { item: layer } } })
  .addTupleStatic('highlight', { value: { detail: layer.feature, key: 'analysis-detail' } })
  .addCommand(({ layer }: MenuItemProps) => console.info('Action done!', layer))
  .build();

const analysisMenu = createMenuBuilder().item().setName('Analyze & Highlight').setIcon(mdiFormatLineStyle).setClick(complexClick).build();
```

#### Notes

- If only one action is added, `.build()` returns that action directly (function or string). Otherwise, it returns an array for handling as a chain.
- Tuples allow integration with global action handlers (such as 'addComponent', 'fitBounds', etc).

See the main documentation above for integration of these handlers in your dataset menu system.

---
