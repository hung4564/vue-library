import React from 'react';

export interface InputTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function InputTextarea({
  label,
  value,
  onChange,
  className = '',
  ...props
}: InputTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="input-container">
        <textarea
          {...props}
          value={value}
          onChange={handleChange}
          className={className}
        />
      </div>
    </div>
  );
}
