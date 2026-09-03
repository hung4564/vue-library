import type { WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { CREATE_CONTROL_LOCALE, suggestLayerName } from '@hungpvq/map-dataset';
import {
  BaseButton,
  InputSelect,
  InputText,
  ModuleContainer,
  defaultMapProps,
  useLang,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/react-map-core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMapDataset } from '../../store';
import { CreateConfigForm, hasCreateConfigSettings } from './config';
import { LAYER_TYPES, LayerHelper, type LayerType } from './helper';

export interface CreateControlProps extends WithMapPropType {
  show: boolean;
  onShowChange: (show: boolean) => void;
}

export function CreateControl(props: CreateControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps } = useMap({ ...merged, controlId: 'mapCreateControl' });
  const { trans, setLocaleDefault } = useLang(mapId);
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
    }),
    actions: [
      {
        type: 'mapCreateControl',
        run: () => props.onShowChange(!props.show),
      },
    ],
  });
  const localeInitialized = useRef(false);
  if (!localeInitialized.current) {
    setLocaleDefault(CREATE_CONTROL_LOCALE);
    localeInitialized.current = true;
  }

  const { addDataset } = useMapDataset(mapId);
  const initialType: LayerType = 'vector';
  const [helper, setHelper] = useState(() => new LayerHelper(initialType));
  const [configKey, setConfigKey] = useState(0);
  const [form, setForm] = useState<{ type: LayerType; config: Record<string, unknown> }>({
    type: initialType,
    config: { name: suggestLayerName(initialType), ...helper.default_value },
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const itemsType = useMemo(
    () => (Object.keys(LAYER_TYPES) as LayerType[]).map((x) => ({ value: x, text: LAYER_TYPES[x] })),
    [],
  );

  function onChangeType(type: string) {
    const layerType = type as LayerType;
    const nextHelper = new LayerHelper(layerType);
    const prevSuggested = suggestLayerName(form.type);
    const keepName = form.config.name && form.config.name !== prevSuggested;

    setHelper(nextHelper);
    setForm((prev) => ({
      type: layerType,
      config: {
        name: keepName ? prev.config.name : suggestLayerName(layerType),
        ...nextHelper.default_value,
      },
    }));
    setConfigKey((k) => k + 1);
  }

  async function onAddLayer() {
    if (creating || !helper.validate(form.config)) return;
    const name = String(form.config.name ?? '');
    setCreating(true);
    setCreateError('');
    try {
      addDataset(await helper.create({ ...form.config, name }));
      reset();
      props.onShowChange(false);
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : trans('map.layer-control.create.create-error'),
      );
    } finally {
      setCreating(false);
    }
  }

  function reset() {
    const nextHelper = new LayerHelper(initialType);
    setHelper(nextHelper);
    setConfigKey((k) => k + 1);
    setCreating(false);
    setCreateError('');
    setForm({
      type: initialType,
      config: { name: suggestLayerName(initialType), ...nextHelper.default_value },
    });
  }

  useEffect(() => {
    onChangeType(initialType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModuleContainer
      {...moduleContainerProps}
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
              <div className="create-control-form map-row">
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
                    onChange={(v) => setForm({ ...form, config: { ...form.config, name: v } })}
                  />
                </div>

                <div className="map-col-12 create-control-section-label">
                  {trans('map.layer-control.create.data-source')}
                </div>

                <CreateConfigForm
                  key={`${configKey}-data`}
                  section="data"
                  componentKey={helper.componentKey}
                  config={form.config}
                  trans={trans}
                  onChange={(patch) =>
                    setForm({ ...form, config: { ...form.config, ...patch } })
                  }
                />

                {hasCreateConfigSettings(helper.componentKey) ? (
                  <>
                    <div className="map-col-12 create-control-section-label">
                      {trans('map.layer-control.create.layer-setting')}
                    </div>

                    <CreateConfigForm
                      key={`${configKey}-settings`}
                      section="settings"
                      componentKey={helper.componentKey}
                      config={form.config}
                      trans={trans}
                      onChange={(patch) =>
                        setForm({ ...form, config: { ...form.config, ...patch } })
                      }
                    />
                  </>
                ) : null}
              </div>

              {creating ? (
                <div className="create-control-status">
                  {trans('map.layer-control.create.creating')}
                </div>
              ) : null}
              {createError ? (
                <div className="create-control-sample-error">{createError}</div>
              ) : null}
              <BaseButton
                className="btn-container"
                disabled={creating}
                onClick={() => void onAddLayer()}
              >
                {trans('map.layer-control.create-btn')}
              </BaseButton>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
