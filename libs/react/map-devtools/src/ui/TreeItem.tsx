import { useMemo, useState } from 'react';

export interface TreeItemProps {
  label?: string;
  data: unknown;
  depth?: number;
}

function getValueType(data: unknown) {
  if (data === null) return 'null';
  if (Array.isArray(data)) return 'array';
  return typeof data;
}

export function TreeItem({ label, data, depth = 0 }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const valueType = getValueType(data);

  const hasChildren =
    valueType === 'object' ||
    valueType === 'array' ||
    (valueType === 'function' &&
      typeof data === 'function' &&
      Object.keys(data as object).length > 0);

  const childKeys = useMemo(() => {
    if (!hasChildren || data == null) return [] as string[];
    try {
      return Object.keys(data as object);
    } catch {
      return [];
    }
  }, [data, hasChildren]);

  const displayValue = useMemo(() => {
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';
    if (valueType === 'string') return `"${data}"`;
    if (valueType === 'function') {
      const fn = data as { name?: string };
      return `f ${fn.name || 'anonymous'}()`;
    }
    if (valueType === 'array') return `Array(${(data as unknown[]).length})`;
    if (valueType === 'object') {
      const obj = data as { constructor?: { name?: string } };
      if (obj.constructor && obj.constructor.name !== 'Object') {
        return obj.constructor.name;
      }
      return 'Object';
    }
    return String(data);
  }, [data, valueType]);

  const previewValue =
    valueType === 'array' ? '[...]' : valueType === 'object' ? '{...}' : '';

  const toggle = () => {
    if (hasChildren) {
      setIsOpen((open) => !open);
    }
  };

  return (
    <div className="tree-item">
      <div className="tree-item__row" onClick={toggle}>
        {hasChildren ? (
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
          {displayValue}
        </span>
        {hasChildren && !isOpen ? (
          <span className="tree-item__preview">{previewValue}</span>
        ) : null}
      </div>
      {isOpen && hasChildren ? (
        <div className="tree-item__children">
          {childKeys.map((key) => (
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
