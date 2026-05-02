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

The Identify component can also define custom menus, allowing you to add context-specific actions when a feature is identified. This is useful for providing additional operations such as showing details, exporting data, or triggering custom workflows directly from the identify popup or panel. See [menu](./with-helper-menu) for more details.

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

## Builder Usage

Use the builder for advanced configuration of an Identify component:

```typescript
const builder = createDatasetPartIdentifyComponentBuilder('My identify');

// configure field id and field name
builder.configFieldId('field_id');
builder.configFieldName('field_name');

// assign to a group (optional)
builder.setGroup({ id: 'g1', name: 'Group 1' });

// switch to merged identify
builder.isUseMerge('mapbox-group');

// add menu actions (if the component supports them)
builder.addMenu(myMenuAction);

// or add multiple menu actions at once
builder.addMenus([menu1, menu2]);

builder.setConfigFields([
  { text: 'Id', value: 'id' },
  { text: 'Name', value: 'name' },
]);

// finally, build the component
const identify = builder.build();
```

## Builder Methods

### Core methods

- `configFieldId(field_id: string)`: Set the `field_id` in the identify configuration.
- `configFieldName(field_name: string)`: Set the `field_name` in the identify configuration.
- `setGroup(group: IIdentifyView['group'])`: Assign the identify component to a group (for example `{ id, name }`).
- `isUseMerge(id = 'mapbox-group')`: Use the merged identify component instead of the default one. You can pass a merge group ID.
- `addMenu(menu: MenuAction<IDataset>)`: Add a single menu action to the component.
- `addMenus(menus: MenuAction<IDataset>[])`: Add multiple menu actions at once.
- `build(): IIdentifyView`: Build and return the Identify View component with the configured settings.

### Menu extension (from WithMenuBuilder)

- `addMenu(menu: MenuAction<IDataset>)`: Add a single menu action to the component.
- `addMenus(menus: MenuAction<IDataset>[])`: Add multiple menu actions at once.

### Field extension (from WithFieldBuilder)

- `setConfigFields(fields: FieldFeaturesDef)`: Set field feature definitions for the component configuration.

## Best Practices

- Use single identify for individual feature queries
- Use merged identify to optimize performance for bulk queries
- Customize identify menus for user needs
