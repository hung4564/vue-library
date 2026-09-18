import {
  childKeys,
  displayValue,
  getValueType,
  hasChildren,
  previewValue,
} from '@hungpvq/map-debug';
import { useMemo, useState } from 'react';

export interface TreeItemProps {
  label?: string;
  data: unknown;
  depth?: number;
}

export function TreeItem({ label, data, depth = 0 }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const valueType = getValueType(data);
  const canExpand = hasChildren(data);
  const keys = useMemo(() => childKeys(data), [data]);
  const shown = useMemo(() => displayValue(data), [data]);
  const preview = previewValue(data);

  const toggle = () => {
    if (canExpand) setIsOpen((open) => !open);
  };

  return (
    <div className="tree-item">
      <div className="tree-item__row" onClick={toggle}>
        {canExpand ? (
          <span
            className={`tree-item__toggle${isOpen ? ' tree-item__toggle--open' : ''}`}
          >
            ▶
          </span>
        ) : (
          <span className="tree-item__toggle" />
        )}
        {label ? <span className="tree-item__key">{label}: </span> : null}
        <span className={`tree-item__value tree-item__value--${valueType}`}>
          {shown}
        </span>
        {canExpand && !isOpen ? (
          <span className="tree-item__preview">{preview}</span>
        ) : null}
      </div>
      {isOpen && canExpand ? (
        <div className="tree-item__children">
          {keys.map((key) => (
            <TreeItem
              key={`${depth}-${key}`}
              label={key}
              data={(data as Record<string, unknown>)[key]}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
