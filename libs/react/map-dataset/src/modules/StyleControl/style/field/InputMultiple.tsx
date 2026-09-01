import { BaseButton, InputText } from '@hungpvq/react-map-core';
import Icon from '@mdi/react';
import { mdiDelete } from '@mdi/js';

export function InputMultiple({
  value = [0, 0],
  onChange,
}: {
  value?: number[];
  onChange?: (value: number[]) => void;
  mapId?: string;
}) {
  const form = value.length ? value : [0, 0];

  function onSetValue(next: number, index: number) {
    const copy = [...form];
    copy[index] = next;
    onChange?.(copy);
  }

  function onRemove(index: number) {
    if (form.length <= 2) return;
    onChange?.(form.filter((_, i) => i !== index));
  }

  function onAdd() {
    onChange?.([...form, 0]);
  }

  return (
    <div className="input-array-index">
      {form.map((arr, index) => (
        <div className="input-array-item" key={`array_${index}`}>
          <InputText
            value={String(arr ?? '')}
            type="number"
            onChange={(v) => onSetValue(+v, index)}
          />
          <div className="input-array-item__action">
            {form.length > 2 && (
              <BaseButton onClick={() => onRemove(index)}>
                <Icon path={mdiDelete} size="16px" />
              </BaseButton>
            )}
          </div>
        </div>
      ))}
      <BaseButton onClick={onAdd}> Add</BaseButton>
    </div>
  );
}
