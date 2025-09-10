# Identify Dataset Component

## Overview

The Identify dataset component handles feature identification when users click on the map. It supports both single and merged identification strategies.

## Use Cases

- Displaying feature information on click
- Supporting custom identify actions or menus
- Reducing API requests by merging identify operations

## Single Identify Example

```typescript
const identify = createIdentifyMapboxComponent('single identify', {
  field_id: 'code', // Unique identifier field (default: 'id')
  field_name: 'label', // Display name field (default: 'name')
});
```

## Merged Identify Example

```typescript
const identifyMerged = createIdentifyMapboxMergedComponent('merge identify', { field_id: 'id', field_name: 'name' }, 'name-group-merge');
```

## Custom Menus in Identify

The Identify component can also define custom menus, allowing you to add context-specific actions when a feature is identified. This is useful for providing additional operations such as showing details, exporting data, or triggering custom workflows directly from the identify popup or panel. See [menu](./menu) for more details.

### Example: Adding a Custom Menu to Identify

```typescript
identify.addMenu(
  createMenuItem({
    type: 'item',
    name: 'Show Details',
    icon: mdiInformation,
    click: (feature, mapId) => {
      // Custom logic to show details for the identified feature
    },
  }),
);
```

## API

- `createIdentifyMapboxComponent(name: string, options: object)`: Create a single identify component
- `createIdentifyMapboxMergedComponent(name: string, options: object, groupName: string)`: Create a merged identify component
- `addMenu(menu: MenuAction<T>): void`: Add a custom menu item to the Identify component

## Best Practices

- Use single identify for individual feature queries
- Use merged identify to optimize performance for bulk queries
- Customize identify menus for user needs
