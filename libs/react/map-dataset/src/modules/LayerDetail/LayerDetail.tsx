import { fitBounds } from '@hungpvq/map-core';
import {
  convertItemToFeature,
  LAYER_DETAIL_LOCALE,
  resolveDatasetBbox,
  type FieldFeaturesDef,
  type IDataset,
} from '@hungpvq/map-dataset';
import {
  createExportGeoSubmenu,
  createMenuItemExportGeo,
  getDatasetFeatureCollection,
  getExportGeoMenuOptions,
  hasGeojsonExportData,
} from '@hungpvq/map-dataset/geo-export';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { handleMenuAction } from '@hungpvq/map-dataset/menu';
import {
  ContextMenu,
  DraggableItemPopup,
  type ContextMenuRef,
} from '@hungpvq/react-draggable';
import { MapControlButton, ModuleContainer, useLang, useMap, useRegisterMapControl, useShow } from '@hungpvq/react-map-core';
import { InputTextarea } from '@hungpvq/react-map-core/fields';
import { mdiContentCopy, mdiCrosshairsGps, mdiDownload } from '@mdi/js';
import Icon from '@mdi/react';
import type { Feature, Geometry } from 'geojson';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
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

function itemAsFeature(
  item: Record<string, unknown> | undefined,
): Feature | undefined {
  if (!item?.geometry || typeof item.geometry !== 'object') return undefined;
  return convertItemToFeature(
    item as { id?: string | number; geometry: Geometry },
  );
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
        <MapControlButton variant="plain" onClick={() => copyText(value)} aria-label="Copy">
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
  const { mapId, moduleContainerProps, callMap } = useMap({
    controlId: 'mapLayerDetail',
  });
  const { setFeatureHighlight } = useMapDatasetHighlight(mapId);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(true);
  const exportMenuRef = useRef<ContextMenuRef>(null);

  useEffect(() => {
    setLocaleDefault(LAYER_DETAIL_LOCALE);
  }, [setLocaleDefault]);

  const detailFeature = useMemo(() => itemAsFeature(item), [item]);
  const canFillBound = Boolean(
    detailFeature || (view && resolveDatasetBbox(view)),
  );
  const canExport = Boolean(
    detailFeature || (view && hasGeojsonExportData(view)),
  );

  const layerHost = useMemo<IDataset>(() => {
    if (view) return view;
    return {
      id: 'layer-detail-export',
      getName: () => 'feature',
    } as IDataset;
  }, [view]);

  const exportMenuItem = useMemo(
    () =>
      createMenuItemExportGeo({
        filename: (layer) => layer.getName?.() || 'feature',
        getCollection: async () => {
          if (detailFeature) {
            return {
              type: 'FeatureCollection',
              features: [detailFeature],
            };
          }
          if (view) return getDatasetFeatureCollection(view);
          return null;
        },
      }),
    [detailFeature, view],
  );

  const exportChildren = useMemo(
    () => createExportGeoSubmenu(getExportGeoMenuOptions(exportMenuItem)),
    [exportMenuItem],
  );

  function handleClose() {
    setFeatureHighlight(undefined, 'detail');
    toggleShow(false);
    onClose?.();
  }

  function onFillBound() {
    if (!canFillBound) return;
    callMap((map) => {
      if (detailFeature) {
        fitBounds(map, detailFeature);
        return;
      }
      const bbox = view ? resolveDatasetBbox(view) : undefined;
      if (!bbox) return;
      fitBounds(map, [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ]);
    });
  }

  function onExportClick(event: React.MouseEvent) {
    if (!canExport) return;
    exportMenuRef.current?.open(event);
  }

  function onExportChild(action: MenuAction, event: React.MouseEvent) {
    handleMenuAction(action, {
      event: event.nativeEvent,
      layer: layerHost,
      mapId,
      value: layerHost,
    });
    exportMenuRef.current?.close();
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
        <>
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
              <>
                {canFillBound ? (
                  <MapControlButton
                    variant="plain"
                    title={trans('map.layer-control.info.fillBound')}
                    aria-label={trans('map.layer-control.info.fillBound')}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFillBound();
                    }}
                  >
                    <Icon path={mdiCrosshairsGps} size={16 / 24} />
                  </MapControlButton>
                ) : null}
                {canExport ? (
                  <MapControlButton
                    variant="plain"
                    title={trans('map.layer-control.info.export')}
                    aria-label={trans('map.layer-control.info.export')}
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportClick(e);
                    }}
                  >
                    <Icon path={mdiDownload} size={16 / 24} />
                  </MapControlButton>
                ) : null}
              </>
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
          <ContextMenu ref={exportMenuRef}>
            <ul className="context-menu layer-context-menu">
              {exportChildren.map((child, index) => (
                <li
                  key={child.id || String(index)}
                  className="layer-context-menu__item"
                  onClick={(event) => onExportChild(child, event)}
                >
                  <div className="layer-context-menu__item-icon">
                    <Icon
                      path={('icon' in child && child.icon) || mdiDownload}
                      size="16px"
                    />
                  </div>
                  <span>{('name' in child && child.name) || ''}</span>
                </li>
              ))}
            </ul>
          </ContextMenu>
        </>
      )}
    />
  );
}
