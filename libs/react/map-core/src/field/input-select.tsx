import React from 'react';
import './input-select.css';

export interface SelectItem {
  value: any;
  text: string;
}

export interface InputSelectProps<T = any> extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> {
  label?: string;
  items?: T[] | SelectItem[];
  itemValue?: keyof T | string;
  itemText?: keyof T | string;
  returnObject?: boolean;
  value?: T | (T extends object ? T[keyof T] : T) | string;
  onChange?: (value: T | (T extends object ? T[keyof T] : T) | string) => void;
}

export function InputSelect<T = any>({
  label,
  items = [],
  itemValue = 'value' as any,
  itemText = 'text' as any,
  returnObject = false,
  value,
  onChange,
  placeholder,
  className = '',
  ...props
}: InputSelectProps<T>) {
  function getValue(item: T): T | (T extends object ? T[keyof T] : T) | string {
    if (typeof item === 'string' || returnObject) {
      return item as any;
    }
    if (item && typeof item === 'object' && itemValue) {
      return (item as any)[itemValue];
    }
    return item as any;
  }

  function getText(item: T): string {
    if (typeof item === 'string') {
      return item;
    }
    if (item && typeof item === 'object' && itemText) {
      return String((item as any)[itemText]);
    }
    return String(item);
  }

  function getKey(item: T, index: number): string | number {
    if (typeof item === 'string' || typeof item === 'number') {
      return item;
    }
    if (item && typeof item === 'object' && itemValue) {
      return String((item as any)[itemValue]);
    }
    return index;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedItem = items.find(
      (item) => String(getValue(item)) === selectedValue,
    );
    if (selectedItem) {
      onChange?.(getValue(selectedItem));
    }
    props.onChange?.(e);
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="input-container">
        <select
          {...props}
          value={value !== undefined ? String(value) : ''}
          onChange={handleChange}
          className={className}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {items.map((item, index) => (
            <option key={getKey(item, index)} value={String(getValue(item))}>
              {getText(item)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
