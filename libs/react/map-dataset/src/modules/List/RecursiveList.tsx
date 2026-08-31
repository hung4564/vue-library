import type { GroupTree, Item, TreeItem } from '@hungpvq/map-dataset';
import { ListGroupItem } from './ListGroupItem';
import { ListItem } from './ListItem';

export function RecursiveList({
  item,
  disabledDrag,
  isGroup = (node: TreeItem): node is GroupTree => Array.isArray((node as GroupTree).children),
  renderLeaf,
}: {
  item: TreeItem;
  disabledDrag?: boolean;
  isGroup?: (item: TreeItem) => item is GroupTree;
  renderLeaf?: (item: Item) => React.ReactNode;
}) {
  if (isGroup(item)) {
    return (
      <ListGroupItem item={item} disabledDrag={disabledDrag}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
          {(item.children || []).map((child, index) => (
            <RecursiveList
              key={(child as Item).id || index}
              item={child}
              disabledDrag={disabledDrag}
              isGroup={isGroup}
              renderLeaf={renderLeaf}
            />
          ))}
        </div>
      </ListGroupItem>
    );
  }
  return (
    <ListItem disabledDrag={disabledDrag} item={item as Item}>
      {renderLeaf ? renderLeaf(item as Item) : <span>{String((item as Item).name ?? '')}</span>}
    </ListItem>
  );
}
