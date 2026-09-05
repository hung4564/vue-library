import { useDragContainer } from '../../store';
import { useStoreReactive } from '../../store/useStoreReactive';

export interface ItemProps {
  item: string;
  containerId: string;
}

const TYPE_LABELS: Record<string, string> = {
  'item-popup': 'Popup',
  'item-float': 'Float',
  'item-modal': 'Modal',
  'item-bottom': 'Bottom',
  'item-sidebar': 'Sidebar',
  'item-drawer': 'Drawer',
};

export function Item({ item, containerId }: ItemProps) {
  useStoreReactive();
  const { getItemAction } = useDragContainer(containerId);
  const action = getItemAction(item);
  const title = action?.title || item;
  const typeKey = action?.type || '';
  const typeLabel = TYPE_LABELS[typeKey] || typeKey || '';

  return (
    <span className="mgmt-item-meta">
      {typeLabel ? (
        <span className="mgmt-type" data-type={typeKey}>
          {typeLabel}
        </span>
      ) : null}
      <span className="mgmt-item-title" title={title}>
        {title}
      </span>
    </span>
  );
}
