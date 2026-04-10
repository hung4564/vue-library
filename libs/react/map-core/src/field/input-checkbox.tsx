import React from 'react';
import './input-checkbox.css';

export interface InputCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function InputCheckbox({
  label,
  disabled = false,
  checked = false,
  onChange,
  className = '',
  ...props
}: InputCheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
    props.onChange?.(e);
  };

  return (
    <div className="form-group">
      <div className="form-control form-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={className}
          {...props}
        />
        {label && <label>{label}</label>}
      </div>
    </div>
  );
}
