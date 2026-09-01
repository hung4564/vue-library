import { InputText, useMapImages } from '@hungpvq/react-map-core';

export function InputImage({
  value,
  onChange,
  mapId = '',
}: {
  value?: string;
  onChange?: (value: string | undefined) => void;
  mapId?: string;
}) {
  const { images, toDataURL } = useMapImages(mapId);

  function onSetValue(next: string) {
    onChange?.(next === value ? undefined : next);
  }

  return (
    <div className="input-image">
      <div>
        <InputText
          value={value || ''}
          onChange={(v) => onSetValue(v)}
        />
      </div>
      <div className="fill-canvas">
        {Object.entries(images).map(([name, styleImage]) => (
          <div
            key={name}
            className={`item-icon${name === value ? ' item-icon-active' : ''}`}
          >
            <div className="item-image">
              <img
                src={toDataURL(name, styleImage)}
                alt={name}
                onClick={() => onSetValue(name)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
