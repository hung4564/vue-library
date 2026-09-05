import {
  convertTabWithDefaultConfig,
  DEFAULT_VALUE,
  TABS,
  type Tab,
  type TabConfig,
} from '@hungpvq/map-dataset';
import { BaseCollapse, InputSlider } from '@hungpvq/react-map-core';
import { copyByJson } from '@hungpvq/shared';
import type { LayerSpecification } from 'maplibre-gl';
import { useEffect, useMemo, useState } from 'react';
import { TabContent } from '../component/TabContent';
import { TabItem } from '../component/TabItem';
import { CONFIG_TABS } from './type/default';
import type { TransFn } from './type/tab-utils';

function getTabValue(layer: LayerSpecification, tab: Tab): unknown {
  if (tab.type === 'divider' || !('key' in tab) || !tab.key) return undefined;
  const part = tab.part || 'paint';
  const bag = layer[part] as Record<string, unknown> | undefined;
  return bag?.[String(tab.key)];
}

function getDefaultTabValue(layerType: string, tab: Tab): unknown {
  if (tab.type === 'divider' || !('key' in tab) || !tab.key) return undefined;
  const defaults = DEFAULT_VALUE[layerType];
  const part = tab.part || 'paint';
  const bag = defaults?.[part] as Record<string, unknown> | undefined;
  return bag?.[String(tab.key)];
}

export function SingleStyle({
  value,
  trans,
  mapId,
  onUpdateStyle,
}: {
  value?: LayerSpecification;
  trans: TransFn;
  mapId: string;
  onUpdateStyle?: (layer: LayerSpecification) => void;
}) {
  const layer = value;
  const tabs_format = useMemo<TabConfig[]>(() => {
    if (!layer) return [];
    const tab = TABS[layer.type];
    if (!tab) return [];
    if (tab.type === 'multi') {
      return tab.tabs.map((x) => ({
        ...x,
        items: convertTabWithDefaultConfig(x.items, CONFIG_TABS),
      }));
    }
    return [
      {
        type: 'single',
        text: 'style',
        items: convertTabWithDefaultConfig(tab.items, CONFIG_TABS),
      },
    ];
  }, [layer]);

  const [tabGroup, setTabGroup] = useState<TabConfig | undefined>();
  const [tab, setTab] = useState<Tab | undefined>();

  useEffect(() => {
    if (tabs_format[0]) {
      onSelectTabGroup(tabs_format[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs_format]);

  function onSelectTab(item: Tab) {
    const next = { ...item } as Tab & {
      menu?: {
        text?: string;
        subtitle?: string;
        text_trans?: string;
        subtitle_trans?: string;
      }[];
    };
    if (next.menu) {
      next.menu = next.menu.map((x) => ({
        ...x,
        text: x.text || trans(x.text_trans || '') || '',
        subtitle: x.subtitle || trans(x.subtitle_trans || '') || '',
      }));
    }
    setTab(next);
  }

  function onSelectTabGroup(group: TabConfig) {
    setTabGroup(group);
    if (group.items?.[0]) onSelectTab(group.items[0]);
  }

  function emitLayer(next: LayerSpecification) {
    onUpdateStyle?.(next);
  }

  function emitInput(raw: unknown, currentTab: Tab, currentLayer: LayerSpecification) {
    if (currentTab.type === 'divider' || !('key' in currentTab)) return;
    let nextValue = raw;
    if (currentTab.format) {
      nextValue = currentTab.format(nextValue);
    }
    const next = copyByJson(currentLayer) as LayerSpecification;
    const part = currentTab.part || 'paint';
    const bag = {
      ...((next[part] as Record<string, unknown> | undefined) || {}),
      [String(currentTab.key)]: nextValue,
    };
    (next as Record<string, unknown>)[part] = bag;
    emitLayer(next);
  }

  function onChangeMinZoom(zoom: number, currentLayer: LayerSpecification) {
    const next = copyByJson(currentLayer) as LayerSpecification & {
      'min-zoom'?: number;
    };
    next['min-zoom'] = zoom;
    emitLayer(next);
  }

  function onChangeMaxZoom(zoom: number, currentLayer: LayerSpecification) {
    const next = copyByJson(currentLayer) as LayerSpecification & {
      'max-zoom'?: number;
    };
    next['max-zoom'] = zoom;
    emitLayer(next);
  }

  if (!layer) return null;

  const layerZoom = layer as LayerSpecification & {
    'min-zoom'?: number;
    'max-zoom'?: number;
  };

  return (
    <div className="style-edit-container">
      <BaseCollapse header={trans('map.style-control.layer.title')}>
        <div className="label-config-container">
          <div className="label-config-item">
            <div className="label-config-item__label">
              {trans('map.style-control.layer.id')}
            </div>
            <div className="label-config-item__input">{layer.id}</div>
          </div>
          <div className="label-config-item">
            <div className="label-config-item__label">
              {trans('map.style-control.layer.type')}
            </div>
            <div className="label-config-item__input">{layer.type}</div>
          </div>
          <div className="label-config-item">
            <div className="label-config-item__label">
              {trans('map.style-control.layer.min-zoom')}
            </div>
            <div className="label-config-item__input">
              <InputSlider
                value={layerZoom['min-zoom'] != null ? layerZoom['min-zoom'] : 0}
                onChange={(v) => onChangeMinZoom(v, layer)}
                min={0}
                max={24}
                step={1}
              />
            </div>
          </div>
          <div className="label-config-item">
            <div className="label-config-item__label">
              {trans('map.style-control.layer.max-zoom')}
            </div>
            <div className="label-config-item__input">
              <InputSlider
                value={layerZoom['max-zoom'] != null ? layerZoom['max-zoom'] : 24}
                onChange={(v) => onChangeMaxZoom(v, layer)}
                min={0}
                max={24}
                step={1}
              />
            </div>
          </div>
        </div>
      </BaseCollapse>

      <BaseCollapse header={trans('map.style-control.style.title')}>
        {tabs_format.length > 1 && (
          <div className="tab-group-label">
            {tabs_format.map((item, i) => (
              <div
                key={item.trans || item.text || i}
                className={`tab clickable${
                  tabGroup && tabGroup.trans === item.trans ? ' tab-active' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTabGroup(item);
                }}
              >
                {item.text || (item.trans ? trans(item.trans) : '')}
              </div>
            ))}
          </div>
        )}
        <div className="tab-group-container">
          <div className="label-container">
            {tabGroup &&
              tabGroup.items.map((item, i) => (
                <div
                  key={'key' in item ? String(item.key) : `divider-${i}`}
                  className="clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTab(item);
                  }}
                >
                  {item.type === 'divider' ? (
                    <div className="tab-divider" />
                  ) : (
                    <TabItem
                      value={getTabValue(layer, item)}
                      item={item}
                      text={item.text || (item.trans ? trans(item.trans) : '')}
                      default_value={getDefaultTabValue(layer.type, item)}
                      active={
                        !!tab &&
                        'key' in tab &&
                        'key' in item &&
                        tab.key === item.key
                      }
                      disabled={item.disabled?.(layer)}
                    />
                  )}
                </div>
              ))}
          </div>
          <div className="value-container">
            <div>
              {tab && tab.type !== 'divider' && (
                <>
                  <div className="value-container__label">
                    {tab.text || (tab.trans ? trans(tab.trans) : '')}
                  </div>
                  <TabContent
                    item={tab}
                    value={getTabValue(layer, tab)}
                    onInput={(v) => emitInput(v, tab, layer)}
                    default_value={getDefaultTabValue(layer.type, tab)}
                    trans={trans}
                    mapId={mapId}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </BaseCollapse>
    </div>
  );
}
