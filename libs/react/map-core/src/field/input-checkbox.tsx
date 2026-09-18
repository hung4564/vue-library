import React, { useId } from 'react';

export interface InputCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked'> {
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
  id,
  ...props
}: InputCheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className="form-group">
      <div className="form-control form-checkbox">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={className}
          {...props}
        />
        {label ? <label htmlFor={inputId}>{label}</label> : null}
      </div>
    </div>
  );
}
