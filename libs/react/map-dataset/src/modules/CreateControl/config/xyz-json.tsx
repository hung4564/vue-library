import {
  applyCreateControlSample,
  applyCreateControlLayerName,
  CREATE_CONTROL_DEFAULT_DATA_TAB,
  CREATE_CONTROL_SAMPLE_NONE,
  findCreateControlSampleMatchingUrl,
  getCreateControlDataTabs,
  getCreateControlSamples,
  layerNameFromUrl,
  resolveCreateControlSampleIdAfterUrlEdit,
  resolveCreateControlSampleSelection,
  type CreateControlDataTab,
} from '@hungpvq/map-dataset/create-control';
import { MapControlButton } from '@hungpvq/react-map-core';
import { InputActionRow, InputSelect, InputText } from '@hungpvq/react-map-core/fields';
import { useMemo, useState } from 'react';
import { DataSourceTabs } from './DataSourceTabs';
import type { CreateConfigFormProps } from './types';

/** Raster XYZ data source — mirrors Vue `xyz-json.vue`. */
export function ConfigRasterJson({ config, onChange, trans }: CreateConfigFormProps) {
  const [sampleId, setSampleId] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');
  const dataTabs = getCreateControlDataTabs('rasterxyz');
  const [activeDataTab, setActiveDataTab] = useState<CreateControlDataTab>(
    CREATE_CONTROL_DEFAULT_DATA_TAB,
  );
  const sampleItems = useMemo(
    () => [
      { value: '', text: CREATE_CONTROL_SAMPLE_NONE },
      ...getCreateControlSamples('rasterxyz').map((item) => ({
        value: item.id,
        text: item.label,
      })),
    ],
    [],
  );
  function onSelectSample(id: string) {
    setSampleId(id);
    setUrlError('');
    const url = resolveCreateControlSampleSelection('rasterxyz', id);
    if (url != null) setDataUrl(url);
  }
  function onUrlInput(value: string) {
    setDataUrl(value);
    setUrlError('');
    setSampleId((current) =>
      resolveCreateControlSampleIdAfterUrlEdit('rasterxyz', current, value),
    );
  }
  async function onLoadUrl() {
    const url = dataUrl.trim();
    if (!url) return;
    setLoadingUrl(true);
    setUrlError('');
    try {
      const sample = findCreateControlSampleMatchingUrl('rasterxyz', sampleId, url);
      if (sample) {
        const patch = await applyCreateControlSample(sample);
        onChange({
          ...patch,
          name: applyCreateControlLayerName(
            typeof config.name === 'string' ? config.name : '',
            sample.label,
            'rasterxyz',
          ),
        });
      } else {
        onChange({
          url,
          tiles: [url],
          name: applyCreateControlLayerName(
            typeof config.name === 'string' ? config.name : '',
            layerNameFromUrl(url),
            'rasterxyz',
          ),
        });
      }
      setActiveDataTab(CREATE_CONTROL_DEFAULT_DATA_TAB);
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
        <DataSourceTabs
          tabs={dataTabs}
          trans={trans}
          activeTab={activeDataTab}
          onActiveTabChange={setActiveDataTab}
        >
          {{
            raw: (
              <InputText
                label={trans('map.layer-control.field.url')}
                value={(config.url as string) || ''}
                onChange={(v) => {
                  setSampleId('');
                  setDataUrl('');
                  setUrlError('');
                  onChange({ url: v, tiles: v ? [v] : [] });
                }}
              />
            ),
            url: (
              <>
                <InputSelect
                  label={trans('map.layer-control.create.sample')}
                  value={sampleId}
                  items={sampleItems}
                  onChange={(v) => onSelectSample(String(v))}
                />
                <InputActionRow
                  action={
                    <MapControlButton
                      variant="tonal"
                      disabled={loadingUrl || !dataUrl.trim()}
                      onClick={() => void onLoadUrl()}
                    >
                      {loadingUrl
                        ? trans('map.layer-control.create.loading-url')
                        : trans('map.layer-control.create.load')}
                    </MapControlButton>
                  }
                >
                  <InputText
                    label={trans('map.layer-control.field.url')}
                    value={dataUrl}
                    onChange={(v) => onUrlInput(v)}
                  />
                </InputActionRow>
                {urlError ? (
                  <div className="create-control-sample-error">{urlError}</div>
                ) : null}
              </>
            ),
          }}
        </DataSourceTabs>
      </div>
    </div>
  );
}
