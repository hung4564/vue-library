import type { IViewSettingField } from '@hungpvq/map-core';

export interface MeasurementSettingFieldsProps {
  fields?: IViewSettingField[];
}

export function MeasurementSettingFields({
  fields = [{ text: 'Status', value: 'waiting...' }],
}: MeasurementSettingFieldsProps) {
  return (
    <div className="map-measurement-fields">
      {fields.map((field, i) => (
        <div className="map-measurement-fields__item" key={i}>
          <div className="map-measurement-fields__row">
            <div className="map-measurement-fields__label">{field.text}</div>
            <div className="map-measurement-fields__value">{field.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
