import React from 'react';
import './input-text.css';

export interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export function InputText({
  label,
  disabled = false,
  value,
  onChange,
  className = '',
  ...props
}: InputTextProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="input-container">
        <input
          {...props}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={className}
        />
      </div>
    </div>
  );
}
