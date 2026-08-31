import type { WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  BaseButton,
  InputSelect,
  InputText,
  ModuleContainer,
  defaultMapProps,
  useLang,
  useMap,
} from '@hungpvq/react-map-core';
import { useEffect, useMemo, useState } from 'react';
import { useMapDataset } from '../../store';
import { CreateConfigForm } from './config';
import { LAYER_TYPES, LayerHelper, type LayerType } from './helper';

export interface CreateControlProps extends WithMapPropType {
  show: boolean;
  onShowChange: (show: boolean) => void;
}

export function CreateControl(props: CreateControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps } = useMap(merged);
  const { trans } = useLang(mapId);
  const { addDataset } = useMapDataset(mapId);
  const initialType: LayerType = 'geojson';
  const [helper] = useState(() => new LayerHelper(initialType));
  const [form, setForm] = useState<{ type: LayerType; config: Record<string, unknown> }>({
    type: initialType,
    config: { name: '', ...helper.default_value },
  });

  const itemsType = useMemo(
    () => (Object.keys(LAYER_TYPES) as LayerType[]).map((x) => ({ value: x, text: LAYER_TYPES[x] })),
    [],
  );

  function onChangeType(type: string) {
    const layerType = type as LayerType;
    helper.setType(layerType);
    setForm((prev) => ({
      type: layerType,
      config: { name: prev.config.name, ...helper.default_value },
    }));
  }

  function onAddLayer() {
    if (!helper.validate(form.config)) return;
    const name = String(form.config.name ?? '');
    addDataset(helper.create({ ...form.config, name }));
    reset();
    props.onShowChange(false);
  }

  function reset() {
    helper.setType(initialType);
    setForm({ type: initialType, config: { name: '', ...helper.default_value } });
  }

  useEffect(() => {
    onChangeType(initialType);
    // Intentionally once on mount (matches Vue setup init).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) =>
        props.show ? (
          <DraggableItemPopup
            show={props.show}
            onUpdateShow={(v) => {
              if (!v) reset();
              props.onShowChange(!!v);
            }}
            title={trans('map.layer-control.create.title')}
            width={400}
            height={320}
            containerId={bind.containerId}
            top={bind.top}
            bottom={bind.bottom}
            left={bind.left}
          >
            <div className="create-control-container">
              <div className="create-control-form map-row">
                <div className="map-col-12">
                  <InputText
                    label={trans('map.layer-control.field.name')}
                    value={String(form.config.name ?? '')}
                    onChange={(v) => setForm({ ...form, config: { ...form.config, name: v } })}
                  />
                </div>
                <div className="map-col-12">
                  <InputSelect
                    label={trans('map.layer-control.field.type')}
                    value={form.type}
                    items={itemsType}
                    onChange={(v) => onChangeType(String(v))}
                  />
                </div>
                <CreateConfigForm
                  componentKey={helper.componentKey}
                  config={form.config}
                  trans={trans}
                  onChange={(patch) =>
                    setForm({ ...form, config: { ...form.config, ...patch } })
                  }
                />
              </div>
              <BaseButton className="btn-container" onClick={onAddLayer}>
                {trans('map.layer-control.create-btn')}
              </BaseButton>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
