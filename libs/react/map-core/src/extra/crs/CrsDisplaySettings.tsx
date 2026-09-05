import {
  CRS_CONTROL_LOCALE,
  buildMapCrsCatalog,
  formatCrsLabel,
  lookupCrsItem,
  normalizeEpsgCode,
  resolveCrsDisplayItems,
} from '@hungpvq/map-core';
import { useEffect, useMemo, useState } from 'react';
import { BaseButton, InputCrs } from '../../field';
import { useLang } from '../lang';
import { useMap } from '../../hooks';
import { useMapCrsDisplayEpsgs, useMapCrsItems } from './useMapCrsItems';

export function CrsDisplaySettings() {
  const { mapId } = useMap();
  const { trans, setLocaleDefault } = useLang(mapId);
  const { items: crsItems } = useMapCrsItems(mapId);
  const { displayEpsgs, setDisplayEpsgs } = useMapCrsDisplayEpsgs(mapId);
  const [draftEpsg, setDraftEpsg] = useState('');

  const catalog = useMemo(() => buildMapCrsCatalog(crsItems), [crsItems]);
  const displayItems = useMemo(
    () => resolveCrsDisplayItems(displayEpsgs, catalog),
    [displayEpsgs, catalog],
  );

  useEffect(() => {
    setLocaleDefault(CRS_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  function onAdd() {
    const epsg = normalizeEpsgCode(draftEpsg);
    if (!epsg || displayEpsgs.includes(epsg)) return;
    if (!lookupCrsItem(epsg, catalog)) return;
    setDisplayEpsgs([...displayEpsgs, epsg]);
    setDraftEpsg('');
  }

  function onRemove(epsg: string) {
    if (epsg === '4326') return;
    setDisplayEpsgs(displayEpsgs.filter((code) => code !== epsg));
  }

  return (
    <div className="crs-display-settings">
      <div className="crs-display-settings__title">
        {trans('map.crs-display.title')}
      </div>
      <ul className="crs-display-settings__list">
        {displayItems.map((item) => (
          <li key={item.epsg} className="crs-display-settings__item">
            <span className="crs-display-settings__label">{formatCrsLabel(item)}</span>
            {item.epsg !== '4326' ? (
              <button
                type="button"
                className="clickable crs-display-settings__remove"
                onClick={() => onRemove(item.epsg)}
              >
                {trans('map.crs-display.remove')}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="crs-display-settings__add">
        <InputCrs value={draftEpsg} onChange={setDraftEpsg} />
        <BaseButton className="crs-display-settings__add-btn" onClick={onAdd}>
          {trans('map.crs-display.add')}
        </BaseButton>
      </div>
    </div>
  );
}
