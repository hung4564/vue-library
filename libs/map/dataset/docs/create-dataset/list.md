# List UI Dataset Component

## Overview

The List UI dataset component defines how a dataset appears in the layer control list and what user actions are available in the UI. It allows customization of display properties, menus, and events for user interaction.

## Use Cases

- Displaying datasets in a sidebar or control panel
- Allowing users to toggle visibility, adjust opacity, or access dataset-specific actions
- Grouping datasets for better organization

## Basic Usage

```typescript
import { createDatasetPartListViewUiComponent } from '@hungpvq/vue-map-dataset';

const listView = createDatasetPartListViewUiComponent('My Layer');
listView.color = '#ff6b6b';
listView.opacity = 0.8;
```

## Builder Usage

For advanced configuration, use the builder:

```typescript
const builder = createDatasetPartListViewUiComponentBuilder('My list');
builder.setColor('#4ecdc4');
builder.configDisabledOpacity();
const list = builder.build();
```

### Builder Methods

- `setColor(color: string)`: Set the color for the list item
- `setOpacity(opacity: number)`: Set the opacity
- `setGroup(group: string | { name: string; id: string })`: Assign to a group
- `setLegend(legend: any)`: Set legend information
- `configDisabledOpacity()`: Disable opacity adjustment
- `configDisabledDelete()`: Disable delete action
- `configInitShowLegend()`: Set default legend visibility

## Sub List and Group Sub List Builders

For more complex list structures, you can use the following builders:

### createDatasetPartSubListViewUiComponentBuilder

This builder is used to create sub-list items, which are typically children of a group list.

```typescript
const subListBuilder = createDatasetPartSubListViewUiComponentBuilder('Sub List');
subListBuilder.setColor('#ffa500');
subListBuilder.setOpacity(0.7);
const subList = subListBuilder.build();
```

#### Sub List Builder Methods

- Inherits all methods from `createDatasetPartListViewUiComponentBuilder` (setColor, setOpacity, setGroup, setLegend, etc.)

### createDatasetPartGroupSubListViewUiComponentBuilder

This builder is used to create group list items that can contain sub-lists or other group lists.

```typescript
const groupListBuilder = createDatasetPartGroupSubListViewUiComponentBuilder('Example Group List');
groupListBuilder.setColor('#00bfff');
groupListBuilder.configInitShowChildren(); // Show children by default
const groupList = groupListBuilder.build();
```

#### Group Sub List Builder Methods

- Inherits all methods from `createDatasetPartListViewUiComponentBuilder`
- `configInitShowChildren()`: Set whether child lists are shown by default

## Grouped List View Example

```typescript
import { createDatasetPartGroupSubListViewUiComponent, createDatasetPartSubListViewUiComponent } from '@hungpvq/vue-map-dataset';

const groupList = createDatasetPartGroupSubListViewUiComponent('My Group');
const subList1 = createDatasetPartSubListViewUiComponent('Sub list 1');
groupList.add(subList1);
```

## Menu Customization

You can define custom menus for list items (see [menu](./menu) for more details):

```typescript
list.addMenu(
  createMenuItem({
    type: 'item',
    name: 'Download',
    icon: mdiDownload,
    click: async (layer, mapId) => {
      // Custom action
    },
  }),
);
```

## Event Handling

List UI components can emit and listen to events (see the [event](./event) for available events):

```typescript
list.emit('customEvent', data);
list.on('customEvent', (data) => {
  // Handle event
});
```

## Best Practices

- Use groups to organize large numbers of datasets
- Customize menus for user-relevant actions
- Use builder for advanced configuration
