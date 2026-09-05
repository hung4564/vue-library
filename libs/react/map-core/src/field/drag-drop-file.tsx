import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

export interface DragDropFileProps {
  accept?: string;
  multiple?: boolean;
  onChange?: (file: File | File[]) => void;
}

export function DragDropFile({ accept, multiple = false, onChange }: DragDropFileProps) {
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const counterRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const emitFiles = useCallback(
    (files: File[] | null) => {
      if (!files?.length) return;
      onChange?.(multiple ? files : files[0]);
    },
    [multiple, onChange],
  );

  const open = useCallback(() => {
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (event) => {
        const list = (event.target as HTMLInputElement).files;
        if (list?.length) emitFiles(Array.from(list));
        input.value = '';
      };
      inputRef.current = input;
    }
    inputRef.current.accept = accept ?? '*';
    inputRef.current.multiple = multiple;
    inputRef.current.click();
  }, [accept, emitFiles, multiple]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  };

  return (
    <div
      className={`ddf__area${isOverDropZone ? ' ddf__active' : ''}`}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={handleKeyDown}
      onDragEnter={(event) => {
        event.preventDefault();
        counterRef.current += 1;
        setIsOverDropZone(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        counterRef.current -= 1;
        if (counterRef.current <= 0) {
          counterRef.current = 0;
          setIsOverDropZone(false);
        }
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        counterRef.current = 0;
        setIsOverDropZone(false);
        emitFiles(Array.from(event.dataTransfer.files));
      }}
    >
      <label className="ddf__label">
        <span className="ddf__label-inner">
          <svg className="ddf__icon" viewBox="0 0 64 64" aria-hidden="true">
            <path
              fill="currentColor"
              d="M51,27c-.374,0-.742.025-1.109.056a18,18,0,0,0-35.782,0C13.742,27.025,13.374,27,13,27a13,13,0,0,0,0,26H51a13,13,0,0,0,0-26Z"
            />
            <path d="M43.764,41.354l-11-13a1.033,1.033,0,0,0-1.526,0l-11,13A1,1,0,0,0,21,43h7V59h8V43h7a1,1,0,0,0,.764-1.646Z" />
          </svg>
          <span className="ddf__text">Drag and drop your files here</span>
          <span className="ddf__subtext">or click to browse your files</span>
        </span>
      </label>
    </div>
  );
}
