import { InputText } from '@hungpvq/react-map-core';

export function InputArrayIndex({
  value = [],
  items = [],
  onChange,
}: {
  value?: number[];
  items?: { text: string; type?: string; value?: number }[];
  onChange?: (value: number[]) => void;
  mapId?: string;
}) {
  const form = value.length ? value : items.map(() => 0);

  function onSetValue(next: number, index: number) {
    const copy = [...form];
    copy[index] = next;
    onChange?.(copy);
  }

  return (
    <div className="input-array-index">
      {items.map((arr, index) => (
        <div className="input-array-item" key={`array_${index}`}>
          <span> {arr.text}: </span>
          <InputText
            value={String(form[index] ?? '')}
            type={arr.type || 'number'}
            onChange={(v) => onSetValue(+v, index)}
          />
        </div>
      ))}
    </div>
  );
}
