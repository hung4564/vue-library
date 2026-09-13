import type { WithLayerItemMenuComponentType } from '@hungpvq/map-dataset/menu';
import {
  GEO_EXPORT_FORMAT_META,
  GEO_EXPORT_FORMATS,
  createGeoExportController,
  resolveGeoExportOption,
  type GeoExportFormat,
  type GeoExportOptions,
} from '@hungpvq/map-dataset/geo-export';
import { mdiChevronRight, mdiDownload } from '@mdi/js';
import Icon from '@mdi/react';
import { useMemo, useState, type MouseEvent } from 'react';

export function ExportGeoFormatMenu(props: WithLayerItemMenuComponentType) {
  const [open, setOpen] = useState(false);
  const menuExtra = props.item as Record<string, unknown>;
  const formats = useMemo((): GeoExportFormat[] => {
    const fromItem = menuExtra.formats as GeoExportFormat[] | undefined;
    if (fromItem?.length) return fromItem;
    const resolved = props.data
      ? resolveGeoExportOption(props.data)
      : undefined;
    return resolved?.formats?.length
      ? resolved.formats
      : [...GEO_EXPORT_FORMATS];
  }, [menuExtra.formats, props.data]);

  const name = 'name' in props.item ? props.item.name : 'Export';

  async function onFormat(format: GeoExportFormat, event: MouseEvent) {
    event.stopPropagation();
    if (!props.data) return;
    const resolved = resolveGeoExportOption(props.data, {
      ...(menuExtra as GeoExportOptions),
      formats,
      uiMode: 'menu',
    });
    const ctrl = createGeoExportController(props.data, {
      ...resolved,
      mapId: props.mapId,
    });
    try {
      await ctrl.run({ format, mapId: props.mapId });
    } finally {
      ctrl.dispose();
      props.onClose?.();
    }
  }

  return (
    <li
      className={[
        'layer-context-menu__item',
        'layer-context-menu__item--has-children',
        open ? 'is-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(event) => {
        event.stopPropagation();
        setOpen((prev) => !prev);
      }}
    >
      <div className="layer-context-menu__item-icon">
        <Icon path={mdiDownload} size="16px" />
      </div>
      <span>{name}</span>
      <div className="layer-context-menu__chevron">
        <Icon path={mdiChevronRight} size="16px" />
      </div>
      <ul className="context-menu layer-context-menu layer-context-menu--submenu">
        {formats.map((fmt) => (
          <li
            key={fmt}
            className="layer-context-menu__item"
            onClick={(event) => void onFormat(fmt, event)}
          >
            <div className="layer-context-menu__item-icon">
              <Icon path={mdiDownload} size="16px" />
            </div>
            <span>{GEO_EXPORT_FORMAT_META[fmt].name}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}
