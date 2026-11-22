import { useMemo, useState } from 'react';
import {
  childKeys,
  displayValue,
  getValueType,
  hasChildren,
  previewValue,
  type TreeItemProps,
} from './tree-item';

export type { TreeItemProps, TreeValueType } from './tree-item';

export function TreeItem({
  label,
  data,
  depth = 0,
}: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const valueType = getValueType(data);
  const canExpand = hasChildren(data);
  const keys = useMemo(() => childKeys(data), [data]);

  return (
    <div className="tree-item">
      <div
        className="tree-item__row"
        onClick={() => {
          if (canExpand) setIsOpen((open) => !open);
        }}
      >
        <span
          className={`tree-item__toggle${isOpen ? ' tree-item__toggle--open' : ''}`}
        >
          {canExpand ? '▶' : ''}
        </span>
        {label ? <span className="tree-item__key">{label}: </span> : null}
        <span className={`tree-item__value tree-item__value--${valueType}`}>
          {displayValue(data)}
        </span>
        {canExpand && !isOpen ? (
          <span className="tree-item__preview">{previewValue(data)}</span>
        ) : null}
      </div>
      {isOpen && canExpand
        ? keys.map((key) => (
            <div
              key={`${depth}-${key}`}
              className="tree-item__children"
            >
              <TreeItem
                label={key}
                data={(data as Record<string, unknown>)[key]}
                depth={depth + 1}
              />
            </div>
          ))
        : null}
    </div>
  );
}

export default TreeItem;
