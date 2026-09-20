import {
  CREATE_CONTROL_SAMPLE_NONE,
  getCreateControlSamples,
  loadCreateControlVectorTileFromUrl,
  resolveCreateControlSampleIdAfterUrlEdit,
  resolveCreateControlSampleSelection,
} from '@hungpvq/map-dataset/create-control';
import { MapControlButton } from '@hungpvq/react-map-core';
import { InputActionRow, InputSelect, InputText } from '@hungpvq/react-map-core/fields';
import { useMemo, useState } from 'react';
import type { CreateConfigFormProps } from './types';

/** XYZ URL data source — mirrors Vue `xyz-json.vue` (no data-source tabs). */
export function ConfigRasterJson({ config, onChange, trans }: CreateConfigFormProps) {
  const [sampleId, setSampleId] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');
  const sampleItems = useMemo(
    () => [
      { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
      ...getCreateControlSamples('xyz').map((item) => ({
        value: item.id,
        text: item.label,
      })),
    ],
    [],
  );

  function onSelectSample(id: string) {
    setSampleId(id);
    setUrlError('');
    const url = resolveCreateControlSampleSelection('xyz', id);
    if (url != null) setDataUrl(url);
  }

  function onUrlInput(value: string) {
    setDataUrl(value);
    setUrlError('');
    setSampleId((current) =>
      resolveCreateControlSampleIdAfterUrlEdit('xyz', current, value),
    );
  }

  async function onLoadUrl() {
    const url = dataUrl.trim();
    if (!url) return;
    setLoadingUrl(true);
    setUrlError('');
    try {
      const { patch } = await loadCreateControlVectorTileFromUrl({
        url,
        sampleId,
        currentName: typeof config.name === 'string' ? config.name : '',
        layerKind: 'xyz',
      });
      onChange(patch);
    } catch (err) {
      setUrlError(
        err instanceof Error
          ? err.message
          : trans('map.layer-control.create.url-error'),
      );
    } finally {
      setLoadingUrl(false);
    }
  }

  return (
    <div className="map-row create-control-settings">
      <div className="map-col-12">
        <InputSelect
          label={trans('map.layer-control.create.sample')}
          value={sampleId}
          items={sampleItems}
          onChange={(v) => onSelectSample(typeof v === 'string' ? v : '')}
        />
        <InputActionRow
          action={
            <MapControlButton
              disabled={loadingUrl || !dataUrl.trim()}
              onClick={onLoadUrl}
              variant="tonal"
            >
              {trans('map.layer-control.create.load')}
            </MapControlButton>
          }
        >
          <InputText
            label={trans('map.layer-control.field.url')}
            value={dataUrl}
            onChange={onUrlInput}
          />
        </InputActionRow>
        {loadingUrl ? (
          <div className="create-control-status">
            {trans('map.layer-control.create.loading-url')}
          </div>
        ) : null}
        {urlError ? (
          <div className="create-control-sample-error">{urlError}</div>
        ) : null}
      </div>
    </div>
  );
}
