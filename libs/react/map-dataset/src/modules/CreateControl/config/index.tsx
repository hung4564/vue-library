import { InputFile, InputSelect, InputText, InputTextarea } from '@hungpvq/react-map-core';

type ConfigFormProps = {
  config: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
  trans: (key: string) => string;
};

export function ConfigGeojsonForm({ config, onChange, trans }: ConfigFormProps) {
  return (
    <>
      <div className="map-col-12">
        <InputSelect
          label={trans('map.layer-control.field.type')}
          value={config.type as string}
          items={['point', 'line', 'area']}
          onChange={(v) => onChange({ type: v })}
        />
      </div>
      <div className="map-col-12">
        <InputFile
          accept=".json,.geojson"
          label="GeoJSON file"
          onChange={async (file) => {
            const text = await (file as File).text();
            onChange({ geojson: JSON.parse(text) });
          }}
        />
      </div>
      {!!config.geojson && (
        <div className="map-col-12">
          <InputTextarea value={JSON.stringify(config.geojson, null, 2)} readOnly rows={4} />
        </div>
      )}
    </>
  );
}

export function ConfigRasterUrlForm({ config, onChange, trans }: ConfigFormProps) {
  const bounds = (config.bounds as number[]) || [0, 0, 0, 0];
  return (
    <>
      <div className="map-col-12">
        <InputText
          label={trans('map.layer-control.field.url')}
          value={(config.url as string) || ''}
          onChange={(v) => onChange({ url: v })}
        />
      </div>
      <div className="map-col-6">
        <InputText
          label={trans('map.layer-control.field.minzoom')}
          value={String(config.minzoom ?? 0)}
          onChange={(v) => onChange({ minzoom: Number(v) })}
        />
      </div>
      <div className="map-col-6">
        <InputText
          label={trans('map.layer-control.field.maxzoom')}
          value={String(config.maxzoom ?? 24)}
          onChange={(v) => onChange({ maxzoom: Number(v) })}
        />
      </div>
      {['minx', 'miny', 'maxx', 'maxy'].map((key, i) => (
        <div key={key} className="map-col-6">
          <InputText
            label={trans(`map.layer-control.field.bound.${key}`)}
            value={String(bounds[i] ?? '')}
            onChange={(v) => {
              const next = [...bounds];
              next[i] = Number(v);
              onChange({ bounds: next });
            }}
          />
        </div>
      ))}
    </>
  );
}

export function ConfigRasterJsonForm({ config, onChange, trans }: ConfigFormProps) {
  return (
    <div className="map-col-12">
      <InputText
        label={trans('map.layer-control.field.url')}
        value={(config.url as string) || ''}
        onChange={(v) => onChange({ url: v, tiles: v ? [v] : [] })}
      />
    </div>
  );
}

const FORM_MAP: Record<string, typeof ConfigGeojsonForm> = {
  'create-geojson': ConfigGeojsonForm,
  'create-raster-url': ConfigRasterUrlForm,
  'create-raster-json': ConfigRasterJsonForm,
};

export function CreateConfigForm(props: {
  componentKey?: string;
  config: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
  trans: (key: string) => string;
}) {
  const Form = (props.componentKey && FORM_MAP[props.componentKey]) || ConfigGeojsonForm;
  return <Form {...props} />;
}
