import {
  CRS_CONTROL_LOCALE,
  buildMapCrsCatalog,
  formatCrsLabel,
  lookupCrsItem,
  normalizeEpsgCode,
  resolveCrsDisplayItems,
} from '@hungpvq/map-core/crs';
import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useEffect, useMemo, useState } from 'react';
import { MapControlButton } from '../../components/MapControlButton';
import { InputCrs } from '../../field';
import { useMap } from '../../hooks/useMap';
import { useLang } from '../lang/hook';
import { useMapCrsDisplayEpsgs, useMapCrsItems } from './useMapCrsItems';

export interface CrsDisplaySettingsProps {
  /**
   * Dense layout for measurement setting:
   * selected CRS are rendered elsewhere; this block is add-input only.
   */
  compact?: boolean;
  onChange?: () => void;
}

export function CrsDisplaySettings({
  compact = false,
  onChange,
}: CrsDisplaySettingsProps) {
  const { mapId } = useMap();
  const { trans, setLocaleDefault } = useLang(mapId);
  const { items: crsItems } = useMapCrsItems(mapId);
  const { displayEpsgs, setDisplayEpsgs } = useMapCrsDisplayEpsgs(mapId);
  const [draftEpsg, setDraftEpsg] = useState('');
  const [inputKey, setInputKey] = useState(0);

  const catalog = useMemo(() => buildMapCrsCatalog(crsItems), [crsItems]);
  const displayItems = useMemo(
    () => resolveCrsDisplayItems(displayEpsgs, catalog),
    [displayEpsgs, catalog],
  );
  const availableItems = useMemo(
    () => catalog.filter((item) => !displayEpsgs.includes(item.epsg)),
    [catalog, displayEpsgs],
  );

  useEffect(() => {
    setLocaleDefault(CRS_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  function tryAdd(raw: string) {
    const epsg = normalizeEpsgCode(raw);
    if (!epsg || displayEpsgs.includes(epsg)) return false;
    if (!lookupCrsItem(epsg, catalog)) return false;
    setDisplayEpsgs([...displayEpsgs, epsg]);
    onChange?.();
    return true;
  }

  function onAdd() {
    if (!tryAdd(draftEpsg)) return;
    setDraftEpsg('');
    setInputKey((k) => k + 1);
  }

  function onRemove(epsg: string) {
    if (epsg === '4326') return;
    setDisplayEpsgs(displayEpsgs.filter((code) => code !== epsg));
    onChange?.();
  }

  function onDraftChange(value: string) {
    if (compact && value && tryAdd(value)) {
      setDraftEpsg('');
      setInputKey((k) => k + 1);
      return;
    }
    setDraftEpsg(value);
  }

  return (
    <div
      className={`crs-display-settings${compact ? ' crs-display-settings--compact' : ''}`}
    >
      <div className="crs-display-settings__title">
        {compact
          ? trans('map.crs-display.title-short')
          : trans('map.crs-display.title')}
      </div>

      {compact ? (
        <div className="crs-display-settings__add">
          <InputCrs
            key={inputKey}
            value={draftEpsg}
            items={availableItems}
            onChange={onDraftChange}
            placeholder={trans('map.crs-display.add')}
          />
        </div>
      ) : (
        <>
          <ul className="crs-display-settings__list">
            {displayItems.map((item) => (
              <li key={item.epsg} className="crs-display-settings__item">
                <span className="crs-display-settings__label">
                  {formatCrsLabel(item)}
                </span>
                {item.epsg !== '4326' ? (
                  <MapControlButton
                    className="crs-display-settings__remove"
                    variant="plain"
                    size="small"
                    title={trans('map.crs-display.remove')}
                    onClick={() => onRemove(item.epsg)}
                  >
                    <Icon path={mdiClose} size="14px" />
                  </MapControlButton>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="crs-display-settings__add">
            <InputCrs
              value={draftEpsg}
              items={availableItems}
              onChange={setDraftEpsg}
            />
            <MapControlButton
              className="crs-display-settings__add-btn"
              variant="text"
              title={trans('map.crs-display.add')}
              onClick={onAdd}
            >
              {trans('map.crs-display.add')}
            </MapControlButton>
          </div>
        </>
      )}
    </div>
  );
}
