import React from 'react';
import './input-choose.css';

export interface ChooseItem {
  value: any;
  text: string;
}

export interface InputChooseProps {
  label?: string;
  items: ChooseItem[];
  value?: any;
  onChange?: (value: any) => void;
}

export function InputChoose({
  label,
  items,
  value,
  onChange,
  className = '',
}: InputChooseProps) {
  const onSetValue = (item: ChooseItem) => {
    onChange?.(item.value);
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="input-container">
        {items.map((item) => (
          <div
            key={item.value}
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
