import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';

import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  LAYER_TYPES,
  LayerHelper,
  loadCreateControlDraft,
  normalizeLayerType,
  reportCreateLayerError,
  resolveCreateControlLayerTypes,
  saveCreateControlDraft,
  suggestLayerName,
  type LayerType,
} from '@hungpvq/map-dataset/create-control';
import {
  defaultMapProps,
  MapCommonButton,
  MapControlButton,
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import { InputSelect, InputText } from '@hungpvq/react-map-core/fields';
import { mdiPlus } from '@mdi/js';
import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { useMapDataset } from '../../store/dataset-api';
import { GeojsonSettings } from './config/geojson-settings';
import { GeojsonUpload } from './config/geojson-upload';
import { ConfigArchiveSettings } from './config/archive-settings';
import { ConfigFilegdbSettings } from './config/filegdb-settings';
import { ConfigFilegdbUpload } from './config/filegdb-upload';
import { ConfigMbtilesJson } from './config/mbtiles-json';
import { ConfigNo } from './config/no-config';
import type { CreateConfigFormProps } from './config/types';
import { ConfigPmtilesJson } from './config/pmtiles-json';
import { ConfigRasterJson } from './config/xyz-json';
import { ConfigRasterSettings } from './config/xyz-settings';
import { ConfigTilejsonJson } from './config/tilejson-json';

export interface CreateControlProps extends WithMapPropType {
  show: boolean;
  onShowChange: (show: boolean) => void;
  createLayerTypes?: LayerType[];
}

function dataSourceComponent(
  type: LayerType,
): ComponentType<CreateConfigFormProps> {
  switch (type) {
    case 'geojson':
      return GeojsonUpload;
    case 'filegdb':
      return ConfigFilegdbUpload;
    case 'xyz':
      return ConfigRasterJson;
    case 'tilejson':
      return ConfigTilejsonJson;
    case 'mbtiles':
      return ConfigMbtilesJson;
    case 'pmtiles':
      return ConfigPmtilesJson;
    default:
      return ConfigNo;
  }
}

function settingsComponent(
  type: LayerType,
): ComponentType<CreateConfigFormProps> | undefined {
  switch (type) {
    case 'geojson':
      return GeojsonSettings;
    case 'filegdb':
      return ConfigFilegdbSettings;
    case 'xyz':
      return ConfigRasterSettings;
    case 'tilejson':
    case 'mbtiles':
    case 'pmtiles':
      return ConfigArchiveSettings;
    default:
      return undefined;
  }
}

export function CreateControl(props: CreateControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order } = useMap({
    ...merged,
    controlId: 'mapCreateControl',
  });
  const { trans } = useLang(mapId);
  const { panelBind } = useRegisterMapControl(mapId, {
    id: 'mapCreateControl',
    panelKind: 'popup',
    title: trans('map.layer-control.create.title'),
    buttonPosition: merged.position,
    show: props.show,
    setShow: props.onShowChange,
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
      createLayerTypes: props.createLayerTypes,
    }),
    actions: [
      {
        type: 'mapCreateControl',
        run: () => props.onShowChange(!props.show),
      },
    ],
  });

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapCreateControl',
    getState: () =>
      mdiButtonState(mdiPlus, {
        active: props.show,
        title: trans('map.layer-control.create.title'),
        order,
      }),
    onClick: () => props.onShowChange(!props.show),
  });

  useEffect(() => {
    control.sync();
  }, [props.show, control]);

  const localeInitialized = useRef(false);
  if (!localeInitialized.current) {
    localeInitialized.current = true;
  }

  const { addDataset } = useMapDataset(mapId);
  const allowedTypes = useMemo(
    () => resolveCreateControlLayerTypes(props.createLayerTypes),
    [props.createLayerTypes],
  );
  const firstAllowed = allowedTypes[0] ?? 'geojson';
  const [helper, setHelper] = useState(() => new LayerHelper(firstAllowed));
  const [configKey, setConfigKey] = useState(0);
  const [form, setForm] = useState<{
    type: LayerType;
    config: Record<string, unknown>;
  }>({
    type: firstAllowed,
    config: {
      name: suggestLayerName(firstAllowed),
      ...helper.default_value,
    },
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const itemsType = useMemo(
    () =>
      allowedTypes.map((x) => ({
        value: x,
        text: LAYER_TYPES[x],
      })),
    [allowedTypes],
  );

  function onChangeType(type: string) {
    let layerType = normalizeLayerType(type);
    if (allowedTypes.length > 0 && !allowedTypes.includes(layerType)) {
      layerType = firstAllowed;
    }
    const nextHelper = new LayerHelper(layerType);

    setHelper(nextHelper);
    setValidationErrors([]);
    setCreateError('');
    setForm({
      type: layerType,
      config: {
        name: suggestLayerName(layerType),
        ...nextHelper.default_value,
      },
    });
    setConfigKey((k) => k + 1);
  }

  function ensureTypeAllowed(type: LayerType) {
    if (allowedTypes.length === 0) return;
    if (!allowedTypes.includes(type)) {
      onChangeType(firstAllowed);
    }
  }

  async function onAddLayer() {
    if (creating) return;
    const errors = helper.validationErrors(form.config);
    setValidationErrors(errors);
    if (errors.length) return;
    const name = String(form.config.name ?? '');
    setCreating(true);
    setCreateError('');
    try {
      addDataset(await helper.create({ ...form.config, name }));
      reset();
      props.onShowChange(false);
    } catch (err) {
      const mapError = reportCreateLayerError(err, {
        crs: typeof form.config.crs === 'string' ? form.config.crs : undefined,
        layerType: form.type,
        name,
      });
      setCreateError(
        mapError.message ||
          (mapError.context?.['reason'] === 'too_deep_or_circular_or_large'
            ? trans('map.layer-control.create.create-error-data-too-large')
            : trans('map.layer-control.create.create-error')),
      );
    } finally {
      setCreating(false);
    }
  }

  function reset() {
    const type = allowedTypes[0] ?? 'geojson';
    const nextHelper = new LayerHelper(type);
    setHelper(nextHelper);
    setConfigKey((k) => k + 1);
    setCreating(false);
    setCreateError('');
    setValidationErrors([]);
    setForm({
      type,
      config: {
        name: suggestLayerName(type),
        ...nextHelper.default_value,
      },
    });
  }

  useEffect(() => {
    const draft = loadCreateControlDraft(mapId);
    if (draft) {
      if (draft.type) {
        onChangeType(normalizeLayerType(draft.type));
      }
      setForm((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          ...(draft.name ? { name: draft.name } : {}),
          ...(draft.crs ? { crs: draft.crs } : {}),
        },
      }));
      ensureTypeAllowed(
        draft.type ? normalizeLayerType(draft.type) : firstAllowed,
      );
      return;
    }
    onChangeType(firstAllowed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ensureTypeAllowed(form.type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedTypes]);

  useEffect(() => {
    saveCreateControlDraft(mapId, {
      type: form.type,
      name: typeof form.config.name === 'string' ? form.config.name : undefined,
      crs: typeof form.config.crs === 'string' ? form.config.crs : undefined,
    });
  }, [form.type, form.config.name, form.config.crs, mapId]);

  const DataSource = dataSourceComponent(form.type);
  const Settings = settingsComponent(form.type);
  const onConfigChange = (patch: Record<string, unknown>) =>
    setForm({ ...form, config: { ...form.config, ...patch } });

  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              control.onAction(e.nativeEvent);
            }}
          />
        ) : null
      }
      draggable={(bind) =>
        props.show ? (
          <DraggableItemPopup
            {...bind}
            {...panelBind}
            show={props.show}
            onUpdateShow={(v) => {
              if (!v) reset();
              props.onShowChange(!!v);
            }}
            title={trans('map.layer-control.create.title')}
            width={400}
            height={420}
          >
            <div className="create-control-container">
              <div className="form-container create-control-form map-row">
                <div className="map-col-12">
                  <InputSelect
                    label={trans('map.layer-control.field.layer-type')}
                    value={form.type}
                    items={itemsType}
                    onChange={(v) => onChangeType(String(v))}
                  />
                </div>

                <div className="map-col-12">
                  <InputText
                    label={trans('map.layer-control.field.layer-name')}
                    value={String(form.config.name ?? '')}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        config: { ...form.config, name: v },
                      })
                    }
                  />
                </div>

                <div className="map-col-12">
                  <div className="create-control-section-label">
                    {trans('map.layer-control.create.data-source')}
                  </div>
                </div>

                <DataSource
                  key={`${configKey}-data`}
                  mapId={mapId}
                  config={form.config}
                  trans={trans}
                  onChange={onConfigChange}
                />

                {Settings ? (
                  <>
                    <div className="map-col-12">
                      <div className="create-control-section-label">
                        {trans('map.layer-control.create.layer-setting')}
                      </div>
                    </div>

                    <Settings
                      key={`${configKey}-settings`}
                      mapId={mapId}
                      config={form.config}
                      trans={trans}
                      onChange={onConfigChange}
                    />
                  </>
                ) : null}
              </div>

              <div className="create-control-actions">
                {validationErrors.length ? (
                  <div className="create-control-validation">
                    {validationErrors.map((key) => (
                      <div
                        key={key}
                        className="create-control-validation__item"
                      >
                        {trans(`map.layer-control.create.${key}`)}
                      </div>
                    ))}
                  </div>
                ) : null}
                {createError ? (
                  <div className="create-control-sample-error">
                    {createError}
                  </div>
                ) : null}
                {creating ? (
                  <div className="create-control-actions__status">
                    {trans('map.layer-control.create.creating')}
                  </div>
                ) : null}
                <MapControlButton
                  variant="filled"
                  className="btn-container"
                  disabled={creating}
                  onClick={() => void onAddLayer()}
                >
                  {trans('map.layer-control.create-btn')}
                </MapControlButton>
              </div>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
