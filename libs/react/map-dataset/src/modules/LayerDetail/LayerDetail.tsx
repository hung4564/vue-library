import {
  LAYER_DETAIL_LOCALE,
  type FieldFeaturesDef,
  type IDataset,
} from '@hungpvq/map-dataset';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import {
  createMenuConditionContext,
  getItemMenuHost,
  getResolvedMenus,
  handleMenuAction,
  isMenuItemDisabled,
  isMenuItemHidden,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/map-dataset/menu';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  MapControlButton,
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import { InputTextarea } from '@hungpvq/react-map-core/fields';
import { mdiContentCopy } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useMemo, type ReactNode } from 'react';
import { DatasetMenuButton } from '../../extra/menu/dataset-menu-button';
import { useMapDatasetHighlight } from '../../store';

type DetailField = FieldFeaturesDef[number] & { inline?: boolean };

type LayerDetailProps = {
  item?: Record<string, unknown>;
  view?: IDataset;
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
        <MapControlButton
          variant="plain"
          onClick={() => copyText(value)}
          aria-label="Copy"
        >
          <Icon path={mdiContentCopy} size={14 / 24} />
        </MapControlButton>
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
  const { setFeatureHighlight } = useMapDatasetHighlight(mapId);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(true);

  useEffect(() => {
    setLocaleDefault(LAYER_DETAIL_LOCALE);
  }, [setLocaleDefault]);

  const itemMenuHost = useMemo(
    () => (view ? getItemMenuHost(view) : undefined),
    [view],
  );

  const itemMenuConditionCtx = useMemo(
    () =>
      createMenuConditionContext(itemMenuHost ?? view, {
        mapId,
      }),
    [itemMenuHost, view, mapId],
  );

  /** Same item menus as Identify / Attribute Table, minus show-detail (this popup). */
  const itemMenus = useMemo(() => {
    if (!view) return [];
    return getResolvedMenus(view, 'item').filter(
      (menu) =>
        menu.type !== 'divider' &&
        !('id' in menu && menu.id === LIST_VIEW_MENU_ID.item.showDetail) &&
        !isMenuItemHidden(menu, itemMenuConditionCtx),
    );
  }, [view, itemMenuConditionCtx]);

  function handleClose() {
    setFeatureHighlight(undefined, 'detail');
    toggleShow(false);
    onClose?.();
  }

  function onMenuAction(menu: MenuAction, event: React.MouseEvent) {
    if (isMenuItemDisabled(menu, itemMenuConditionCtx)) return;
    const host = itemMenuHost ?? view;
    if (!host) return;
    handleMenuAction(menu, {
      event: event.nativeEvent,
      layer: host,
      mapId,
      value: item,
    });
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
          extraBtn={
            itemMenus.length ? (
              <>
                {itemMenus.map((menu, index) => (
                  <DatasetMenuButton
                    key={menu.id || String(index)}
                    menu={menu}
                    item={itemMenuHost ?? view}
                    mapId={mapId}
                    disabled={isMenuItemDisabled(menu, itemMenuConditionCtx)}
                    onClick={(event) => {
                      event.stopPropagation();
                      onMenuAction(menu, event);
                    }}
                  />
                ))}
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
  );
}
