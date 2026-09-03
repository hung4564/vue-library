import { LAYER_DETAIL_LOCALE, type FieldFeaturesDef } from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  BaseButton,
  InputTextarea,
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import Icon from '@mdi/react';
import { mdiContentCopy } from '@mdi/js';
import { useEffect, type ReactNode } from 'react';
import { useMapDatasetHighlight } from '../../store';

type DetailField = FieldFeaturesDef[number] & { inline?: boolean };

type LayerDetailProps = {
  item?: Record<string, unknown>;
  view?: unknown;
  fields?: DetailField[];
  popupProps?: Record<string, unknown>;
  onClose?: () => void;
};

function copyText(value: unknown) {
  const text = value == null ? '' : String(value);
  void navigator.clipboard?.writeText(text);
}

function TableTdCopy({
  value,
  children,
}: {
  value: unknown;
  children: ReactNode;
}) {
  return (
    <div className="layer-detail-row">
      <div className="layer-detail-row__copy">
        <BaseButton onClick={() => copyText(value)} aria-label="Copy">
          <Icon path={mdiContentCopy} size={14 / 24} />
        </BaseButton>
      </div>
      {children}
    </div>
  );
}

function TableTdLayer({
  field,
  label,
  item,
}: {
  field: DetailField;
  label: string;
  item?: Record<string, unknown>;
}) {
  const raw = item ? item[field.value] : '';
  const text =
    raw == null
      ? ''
      : typeof raw === 'string' ||
          typeof raw === 'number' ||
          typeof raw === 'boolean'
        ? String(raw)
        : JSON.stringify(raw, undefined, 2);

  return (
    <TableTdCopy value={text}>
      {!field.inline ? (
        <div className="layer-detail-grid">
          <div className="layer-detail-grid__label" title={label}>
            {label}
          </div>
          <div className="layer-detail-grid__value">{text}</div>
        </div>
      ) : (
        <div className="layer-detail-grid layer-detail-grid--full">
          <InputTextarea readOnly rows={10} value={text} label={label} />
        </div>
      )}
    </TableTdCopy>
  );
}

export function LayerDetail({
  item,
  fields = [],
  popupProps = {},
  onClose,
}: LayerDetailProps) {
  const { mapId, moduleContainerProps } = useMap({
    controlId: 'mapLayerDetail',
  });
  const { setFeatureHighlight } = useMapDatasetHighlight(mapId);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(true);

  useEffect(() => {
    setLocaleDefault(LAYER_DETAIL_LOCALE);
  }, [setLocaleDefault]);

  function handleClose() {
    setFeatureHighlight(undefined, 'detail');
    toggleShow(false);
    onClose?.();
  }

  const { panelBind } = useRegisterMapControl(mapId, {
    id: 'mapLayerDetail',
    panelKind: 'popup',
    title: trans('map.layer-control.info.title'),
    show,
    setShow: (v) => {
      toggleShow(v);
      if (!v) {
        setFeatureHighlight(undefined, 'detail');
        onClose?.();
      }
    },
    actions: [{ type: 'mapLayerDetail', run: () => toggleShow() }],
  });

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) => (
        <DraggableItemPopup
          show={show}
          onClose={handleClose}
          onUpdateShow={(v) => {
            if (!v) handleClose();
          }}
          width={520}
          {...bind}
          {...panelBind}
          {...popupProps}
          title={trans('map.layer-control.info.title')}
        >
          <div className="table-show-info">
            <div className="table-content">
              {fields.map((field, i) => (
                <TableTdLayer
                  key={i}
                  field={field}
                  label={
                    'trans' in field && field.trans
                      ? trans(field.trans)
                      : 'text' in field
                        ? field.text
                        : ''
                  }
                  item={item}
                />
              ))}
            </div>
          </div>
        </DraggableItemPopup>
      )}
    />
  );
}
