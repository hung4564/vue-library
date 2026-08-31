import type { CrsItem, WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { Icon } from '@mdi/react';
import { mdiDelete, mdiInboxOutline, mdiPlus } from '@mdi/js';
import { useCallback, useEffect } from 'react';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { useLang } from '../../lang';
import { BaseCollapse, InputSelect, InputText } from '../../../field';
import { defaultMapProps, useMap, useShow } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useToolbarControl } from '../../toolbar';
import { useMapCrsItems } from '../useMapCrsItems';

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

  useEffect(() => {
    setLocaleDefault({
      map: {
        'crs-control': {
          title: 'Crs setting',
          field: {
            name: 'name',
            unit: 'unit',
            epsg: 'epsg',
            proj4js: 'proj4js',
          },
        },
      },
    });
  }, [setLocaleDefault]);

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
    },
    [crsItems, setItems],
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
            height={200}
            width={400}
            {...bind}
          >
            <div className="crs-container">
              <div className="crs-container__list">
                {crsItems.map((crsItem, index) => (
                  <BaseCollapse
                    key={crsItem.epsg || `crs-${index}`}
                    selected={false}
                    header={
                      <div className="crs-item-header">
                        <div className="crs-item-header__title">
                          {crsItem.name || crsItem.epsg}
                        </div>
                        {!crsItem.default && (
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
                        )}
                      </div>
                    }
                  >
                    <div className="crs-item">
                      <div>
                        <InputText
                          readOnly={crsItem.default}
                          value={crsItem.name}
                          label={trans('map.crs-control.field.name')}
                          onChange={(v) => updateCrsItem(index, { name: v })}
                        />
                      </div>
                      <div>
                        <InputText
                          readOnly={crsItem.default}
                          value={crsItem.epsg}
                          label={trans('map.crs-control.field.epsg')}
                          onChange={(v) => updateCrsItem(index, { epsg: v })}
                        />
                      </div>
                      {!crsItem.default && (
                        <>
                          <div>
                            <InputText
                              value={crsItem.proj4js || ''}
                              label={trans('map.crs-control.field.proj4js')}
                              onChange={(v) =>
                                updateCrsItem(index, { proj4js: v })
                              }
                            />
                          </div>
                          <div>
                            <InputSelect
                              value={crsItem.unit}
                              label={trans('map.crs-control.field.unit')}
                              items={[...UNIT_ITEMS]}
                              onChange={(v) =>
                                updateCrsItem(index, {
                                  unit: v as CrsItem['unit'],
                                })
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </BaseCollapse>
                ))}
              </div>
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
