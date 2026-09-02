import type { CrsItem, WithMapPropType } from '@hungpvq/map-core';
import {
  buildMapCrsCatalog,
  formatCrsLabel,
  searchCrsCatalog,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { Icon } from '@mdi/react';
import { mdiDelete, mdiInboxOutline, mdiPlus } from '@mdi/js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { useLang } from '../../lang';
import { BaseCollapse, InputSelect, InputText } from '../../../field';
import { defaultMapProps, useMap, useShow } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useToolbarControl } from '../../toolbar';
import { useMapCrsDisplayEpsgs, useMapCrsItems } from '../useMapCrsItems';

export interface CrsControlProps extends WithMapPropType {
  show?: boolean;
}

const UNIT_ITEMS = [
  { text: 'degree', value: 'degree' },
  { text: 'meter', value: 'meter' },
] as const;

export function CrsControl(props: CrsControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order } = useMap(merged);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const { items: crsItems, setItems } = useMapCrsItems(mapId);
  const { displayEpsgs, setDisplayEpsgs } = useMapCrsDisplayEpsgs(mapId);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    setLocaleDefault({
      map: {
        'crs-control': {
          title: 'Crs setting',
          filter: 'Search CRS…',
          custom: 'Custom CRS',
          field: {
            name: 'name',
            unit: 'unit',
            epsg: 'epsg',
            proj4js: 'proj4js',
          },
        },
        'crs-display': {
          show: 'Show in measure',
        },
      },
    });
  }, [setLocaleDefault]);

  const catalogItems = useMemo(
    () => buildMapCrsCatalog(crsItems),
    [crsItems],
  );
  const filteredCatalog = useMemo(() => {
    const q = filterQuery.trim();
    if (!q) return catalogItems;
    return searchCrsCatalog(catalogItems, q);
  }, [catalogItems, filterQuery]);
  const customItems = useMemo(
    () => crsItems.filter((item) => !item.default),
    [crsItems],
  );

  const handleToggle = useCallback(() => {
    toggleShow(!show);
  }, [show, toggleShow]);

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapCrsControl',
    getState() {
      return {
        visible: true,
        title: trans('map.crs-control.title'),
        order,
        icon: { type: 'mdi' as const, path: mdiInboxOutline },
      };
    },
    onClick: handleToggle,
  });

  const updateCrsItem = useCallback(
    (index: number, patch: Partial<CrsItem>) => {
      Object.assign(crsItems[index], patch);
      setItems([...crsItems]);
    },
    [crsItems, setItems],
  );

  const onRemove = useCallback(
    (item: CrsItem) => {
      setItems(crsItems.filter((x) => x.epsg !== item.epsg));
      if (displayEpsgs.includes(item.epsg)) {
        setDisplayEpsgs(displayEpsgs.filter((epsg) => epsg !== item.epsg));
      }
    },
    [crsItems, displayEpsgs, setDisplayEpsgs, setItems],
  );

  const toggleDisplay = useCallback(
    (epsg: string, checked: boolean) => {
      if (epsg === '4326') return;
      if (checked) {
        if (!displayEpsgs.includes(epsg)) {
          setDisplayEpsgs([...displayEpsgs, epsg]);
        }
        return;
      }
      setDisplayEpsgs(displayEpsgs.filter((code) => code !== epsg));
    },
    [displayEpsgs, setDisplayEpsgs],
  );

  const onAdd = useCallback(() => {
    setItems([...crsItems, { name: '', unit: 'degree', epsg: '' }]);
  }, [crsItems, setItems]);

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
        show ? (
          <DraggableItemPopup
            show={show}
            onUpdateShow={(v) => toggleShow(!!v)}
            title={trans('map.crs-control.title')}
            height={480}
            width={400}
            {...bind}
          >
            <div className="crs-container">
              <div className="crs-catalog">
                <input
                  type="search"
                  className="crs-catalog__filter"
                  value={filterQuery}
                  placeholder={trans('map.crs-control.filter')}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
                <ul className="crs-catalog__list">
                  {filteredCatalog.map((item) => (
                    <li key={item.epsg} className="crs-catalog__item">
                      <label
                        className="crs-item-header__display"
                        title={trans('map.crs-display.show')}
                      >
                        <input
                          type="checkbox"
                          checked={displayEpsgs.includes(item.epsg)}
                          disabled={item.epsg === '4326'}
                          onChange={(e) =>
                            toggleDisplay(item.epsg, e.target.checked)
                          }
                        />
                      </label>
                      <span className="crs-catalog__label">
                        {formatCrsLabel(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {customItems.length ? (
                <div className="crs-custom">
                  <div className="crs-custom__title">
                    {trans('map.crs-control.custom')}
                  </div>
                  <div className="crs-custom__list">
                    {customItems.map((crsItem, index) => {
                      const storeIndex = crsItems.indexOf(crsItem);
                      return (
                        <BaseCollapse
                          key={crsItem.epsg || `custom-${index}`}
                          selected={false}
                          header={
                            <div className="crs-item-header">
                              <div className="crs-item-header__title">
                                {crsItem.name || crsItem.epsg || 'New CRS'}
                              </div>
                              <div className="crs-item-header__action">
                                <button
                                  type="button"
                                  className="clickable"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(crsItem);
                                  }}
                                >
                                  <Icon path={mdiDelete} size="16px" />
                                </button>
                              </div>
                            </div>
                          }
                        >
                          <div className="crs-item">
                            <div>
                              <InputText
                                value={crsItem.name}
                                label={trans('map.crs-control.field.name')}
                                onChange={(v) =>
                                  updateCrsItem(storeIndex, { name: v })
                                }
                              />
                            </div>
                            <div>
                              <InputText
                                value={crsItem.epsg}
                                label={trans('map.crs-control.field.epsg')}
                                onChange={(v) =>
                                  updateCrsItem(storeIndex, { epsg: v })
                                }
                              />
                            </div>
                            <div>
                              <InputText
                                value={crsItem.proj4js || ''}
                                label={trans('map.crs-control.field.proj4js')}
                                onChange={(v) =>
                                  updateCrsItem(storeIndex, { proj4js: v })
                                }
                              />
                            </div>
                            <div>
                              <InputSelect
                                value={crsItem.unit}
                                label={trans('map.crs-control.field.unit')}
                                items={[...UNIT_ITEMS]}
                                onChange={(v) =>
                                  updateCrsItem(storeIndex, {
                                    unit: v as CrsItem['unit'],
                                  })
                                }
                              />
                            </div>
                          </div>
                        </BaseCollapse>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="crs-item__add">
                <button
                  type="button"
                  className="crs-item__add-btn clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd();
                  }}
                >
                  <Icon path={mdiPlus} size="16px" />
                </button>
              </div>
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
