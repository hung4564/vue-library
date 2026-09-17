import type { DatasetTreeNode } from '@hungpvq/map-debug/dataset';
import { MapControlButton } from '@hungpvq/react-map-core';
import { useEffect, useState } from 'react';

type NodeProps = {
  node: DatasetTreeNode;
  selectedId?: string;
  highlightedIds?: string[];
  depth: number;
  forceExpandIds?: string[];
  onSelect: (id: string) => void;
};

function DatasetTreeNavNode({
  node,
  selectedId,
  highlightedIds = [],
  depth,
  forceExpandIds,
  onSelect,
}: NodeProps) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const selected = selectedId === node.id;
  const highlighted = highlightedIds.includes(node.id);
  const kind = depth === 0 ? 'root' : hasChildren ? 'group' : 'leaf';
  const kindLabel = kind === 'root' ? 'R' : kind === 'group' ? 'G' : 'L';
  const [open, setOpen] = useState(depth < 1);

  useEffect(() => {
    if (forceExpandIds?.includes(node.id)) setOpen(true);
  }, [forceExpandIds, node.id]);

  return (
    <div
      className="dataset-tree-nav-node"
      role="treeitem"
      aria-expanded={hasChildren ? open : undefined}
      aria-selected={selected}
    >
      <div
        className={[
          'dataset-tree-nav-node__row',
          selected ? 'is-selected' : '',
          highlighted ? 'is-highlighted' : '',
          `is-kind-${kind}`,
        ]
          .filter(Boolean)
          .join(' ')}
        data-dataset-id={node.id}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {hasChildren ? (
          <MapControlButton
            variant="text"
            size="small"
            className="dataset-tree-nav-node__toggle"
            aria-label={open ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? '▾' : '▸'}
          </MapControlButton>
        ) : (
          <span
            className="dataset-tree-nav-node__toggle is-leaf"
            aria-hidden="true"
          >
            ·
          </span>
        )}
        <MapControlButton
          variant="text"
          size="small"
          className="dataset-tree-nav-node__select"
          active={selected}
          title={`${node.name} (${node.type}) · ${node.id}`}
          onClick={() => onSelect(node.id)}
        >
          <span className="dataset-tree-nav-node__kind">{kindLabel}</span>
          <span className="dataset-tree-nav-node__name">{node.name}</span>
          <span className="dataset-tree-nav-node__type">{node.type}</span>
        </MapControlButton>
      </div>
      {hasChildren && open ? (
        <div className="dataset-tree-nav-node__children" role="group">
          {node.children.map((child) => (
            <DatasetTreeNavNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              highlightedIds={highlightedIds}
              depth={depth + 1}
              forceExpandIds={forceExpandIds}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DatasetTreeNav({
  nodes,
  selectedId,
  highlightedIds = [],
  forceExpandIds,
  ariaLabel = 'Store dataset forest',
  onSelect,
}: {
  nodes: DatasetTreeNode[];
  selectedId?: string;
  highlightedIds?: string[];
  forceExpandIds?: string[];
  ariaLabel?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="dataset-tree-nav" role="tree" aria-label={ariaLabel}>
      {nodes.map((node) => (
        <DatasetTreeNavNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          highlightedIds={highlightedIds}
          depth={0}
          forceExpandIds={forceExpandIds}
          onSelect={onSelect}
        />
      ))}
      {!nodes.length ? (
        <p className="dataset-tree-nav__empty">No datasets</p>
      ) : null}
    </div>
  );
}
