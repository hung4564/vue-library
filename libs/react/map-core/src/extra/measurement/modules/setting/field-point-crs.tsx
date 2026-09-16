import type { IViewSettingField } from '@hungpvq/map-core/measurement';
import {
  CRS_CONTROL_LOCALE,
  buildMapCrsCatalog,
  formatCrsLabel,
  resolveCrsDisplayItems,
} from '@hungpvq/map-core/crs';
import { mdiDeleteOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useEffect, useMemo } from 'react';
import { MapControlButton } from '../../../../components/MapControlButton';
import { MapCopyButton } from '../../../../components/MapCopyButton';
import { useMap } from '../../../../hooks/useMap';
import {
  useMapCrsDisplayEpsgs,
  useMapCrsItems,
} from '../../../crs/useMapCrsItems';
import { useLang } from '../../../lang/hook';

export interface FieldPointCrsProps {
  fields?: IViewSettingField[];
  onChange?: () => void;
}

export function FieldPointCrs({
  fields = [],
  onChange,
}: FieldPointCrsProps) {
  const { mapId } = useMap();
  const { trans, setLocaleDefault } = useLang(mapId);
  const { items: crsItems } = useMapCrsItems(mapId);
  const { displayEpsgs, setDisplayEpsgs } = useMapCrsDisplayEpsgs(mapId);

  useEffect(() => {
    setLocaleDefault(CRS_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const catalog = useMemo(() => buildMapCrsCatalog(crsItems), [crsItems]);
  const displayItems = useMemo(
    () => resolveCrsDisplayItems(displayEpsgs, catalog),
    [displayEpsgs, catalog],
  );

  const valueByEpsg = useMemo(() => {
    const map = new Map<string, string>();
    for (const field of fields) {
      const raw = String(field.text ?? field.trans ?? '');
      const match = raw.match(/(\d{3,7})/);
      if (!match) continue;
      map.set(match[1], String(field.value ?? ''));
    }
    return map;
  }, [fields]);

  const rows = displayItems.map((item) => ({
    epsg: item.epsg,
    title: formatCrsLabel(item),
    value: valueByEpsg.get(item.epsg) || '—',
    removable: item.epsg !== '4326',
  }));

  function onRemove(epsg: string) {
    if (epsg === '4326') return;
    setDisplayEpsgs(displayEpsgs.filter((code) => code !== epsg));
    onChange?.();
  }

  return (
    <div className="map-measurement-point-crs">
      {rows.map((row) => (
        <div key={row.epsg} className="map-measurement-point-crs__row">
          <span className="map-measurement-point-crs__epsg" title={row.title}>
            EPSG:{row.epsg}
          </span>
          <span className="map-measurement-point-crs__value">{row.value}</span>
          <div className="map-measurement-point-crs__actions">
            <MapCopyButton
              className="map-measurement-point-crs__action"
              value={row.value}
              title={trans('map.measurement.action.copy')}
              copiedTitle={trans('map.measurement.action.copied')}
            />
            {row.removable ? (
              <MapControlButton
                className="map-measurement-point-crs__action"
                variant="plain"
                size="small"
                title={trans('map.crs-display.remove')}
                onClick={() => onRemove(row.epsg)}
              >
                <Icon path={mdiDeleteOutline} size="14px" />
              </MapControlButton>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
