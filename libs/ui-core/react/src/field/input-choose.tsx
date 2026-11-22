import React from 'react';

export interface ChooseItem<T = unknown> {
  value: T;
  text: string;
}

export interface InputChooseProps<T = unknown> {
  label?: string;
  items: ChooseItem<T>[];
  value?: T;
  onChange?: (value: T) => void;
  className?: string;
}

export function InputChoose<T = unknown>({
  label,
  items,
  value,
  onChange,
  className = '',
}: InputChooseProps<T>) {
  const onSetValue = (item: ChooseItem<T>) => {
    onChange?.(item.value);
  };

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && <label>{label}</label>}
      <div className="input-container">
        {items.map((item) => (
          <div
            key={String(item.value)}
            className={`item-choose ${
              item.value === value ? 'item-choose-active' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSetValue(item);
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
