import React from 'react';

export interface SelectItem {
  value: string | number;
  text: string;
}

export interface InputSelectProps<T = SelectItem>
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string;
  items?: T[];
  itemValue?: keyof T | string;
  itemText?: keyof T | string;
  returnObject?: boolean;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: T | string | number) => void;
}

export function InputSelect<T = SelectItem>({
  label,
  items = [],
  itemValue = 'value' as keyof T,
  itemText = 'text' as keyof T,
  returnObject = false,
  value,
  onChange,
  placeholder,
  className = '',
  ...props
}: InputSelectProps<T>) {
  function getValue(item: T): string | number | T {
    if (returnObject) {
      return item;
    }
    if (typeof item === 'string' || typeof item === 'number') {
      return item;
    }
    if (item && typeof item === 'object' && itemValue) {
      return (item as Record<string, string | number>)[itemValue as string];
    }
    return String(item);
  }

  function getText(item: T): string {
    if (typeof item === 'string' || typeof item === 'number') {
      return String(item);
    }
    if (item && typeof item === 'object' && itemText) {
      return String((item as Record<string, unknown>)[itemText as string]);
    }
    return String(item);
  }

  function getKey(item: T, index: number): string | number {
    if (typeof item === 'string' || typeof item === 'number') {
      return item;
    }
    if (item && typeof item === 'object' && itemValue) {
      return String((item as Record<string, unknown>)[itemValue as string]);
    }
    return index;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedItem = items.find((item) => String(getValue(item)) === selectedValue);
    if (selectedItem !== undefined) {
      onChange?.(getValue(selectedItem) as T | string | number);
    }
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
