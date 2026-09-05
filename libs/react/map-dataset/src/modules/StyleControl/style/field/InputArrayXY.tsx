import { InputText } from '@hungpvq/react-map-core';

export function InputArrayXY({
  value = [0, 0],
  onChange,
}: {
  value?: number[];
  onChange?: (value: number[]) => void;
  mapId?: string;
}) {
  const form = value.length >= 2 ? value : [0, 0];

  function onSetValue(next: number, index: number) {
    const copy = [...form];
    copy[index] = next;
    onChange?.(copy);
  }

  return (
    <div className="input-array-x-y">
      <div className="input-array-item">
        <span> x: </span>
        <InputText
          value={String(form[0] ?? '')}
          type="number"
          onChange={(v) => onSetValue(+v, 0)}
        />
      </div>
      <div className="input-array-item">
        <span> y: </span>
        <InputText
          value={String(form[1] ?? '')}
          type="number"
          onChange={(v) => onSetValue(+v, 1)}
        />
      </div>
    </div>
  );
}
