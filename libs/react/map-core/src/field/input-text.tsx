import React from 'react';

export interface InputTextProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
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
