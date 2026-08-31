import React, { useRef } from 'react';

export interface InputFileProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onChange?: (files: File | File[]) => void;
}

export function InputFile({
  label,
  accept,
  multiple = false,
  onChange,
  className = '',
  ...props
}: InputFileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onChange?.(multiple ? files : files[0]);
    }
    const input = fileInputRef.current;
    if (input) {
      input.type = 'text';
      input.type = 'file';
      input.value = '';
    }
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="input-container">
        <input
          ref={fileInputRef}
          onChange={onChangeFile}
          type="file"
          accept={accept}
          multiple={multiple}
          className={className}
          {...props}
        />
      </div>
    </div>
  );
}
