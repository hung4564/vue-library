import {
  LAYER_DETAIL_LOCALE,
  type FieldFeaturesDef,
  type IDataset,
} from '@hungpvq/map-dataset';
import {
  getItemMenuHost,
  getResolvedMenus,
  MENU_CONTROL_ID,
} from '@hungpvq/map-dataset/menu';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  MapCopyButton,
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import { InputTextarea } from '@hungpvq/react-map-core/fields';
import { useEffect, useMemo, type ReactNode } from 'react';
import { MenuConditionProvider } from '../../extra/menu/condition-context';
import { DatasetMenus } from '../../extra/menu/dataset-menus';
import { useMapHighlight } from '../../store/highlight';

type DetailField = FieldFeaturesDef[number] & { inline?: boolean };

type LayerDetailProps = {
  item?: Record<string, unknown>;
  view?: IDataset;
  fields?: DetailField[];
  popupProps?: Record<string, unknown>;
  onClose?: () => void;
};

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
        <MapCopyButton value={value == null ? '' : String(value)} />
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
  view,
  fields = [],
  popupProps = {},
  onClose,
}: LayerDetailProps) {
  const { mapId, moduleContainerProps } = useMap({
    controlId: 'mapLayerDetail',
  });
  const hl = useMapHighlight(mapId);
  const { trans, registerLocale } = useLang(mapId);
  const [show, toggleShow] = useShow(true);

  useEffect(() => {
    registerLocale('en', LAYER_DETAIL_LOCALE);
  }, [registerLocale]);

  const itemMenuHost = useMemo(
    () => (view ? getItemMenuHost(view) : undefined),
    [view],
  );

  const layerTitleMenus = useMemo(
    () => (view ? getResolvedMenus(view, 'layer') : []),
    [view],
  );

  const itemMenus = useMemo(() => {
    if (!view) return [];
    return getResolvedMenus(view, 'item').filter(
      (menu) => menu.type !== 'divider',
    );
  }, [view]);

  function handleClose() {
    hl.hideIfSource('detail');
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
      if (!v) handleClose();
    },
    actions: [{ type: 'mapLayerDetail', run: () => toggleShow() }],
  });

  const host = itemMenuHost ?? view;

  return (
    <MenuConditionProvider value={{ control: MENU_CONTROL_ID.layerDetail }}>
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
          afterTitle={
            view ? (
              <>
                <DatasetMenus
                  menus={layerTitleMenus}
                  data={view}
                  mapId={mapId}
                  locations={['title']}
                />
                {host ? (
                  <DatasetMenus
                    menus={itemMenus}
                    data={host}
                    mapId={mapId}
                    value={item}
                    locations={['title', 'extra', 'menu']}
                  />
                ) : null}
              </>
            ) : undefined
          }
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
    </MenuConditionProvider>
  );
}
