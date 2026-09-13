import {
  resolveAttributeTableUi,
  type AttributeTableToolbarProps,
} from '@hungpvq/map-dataset/attribute-table';
import {
  GEO_EXPORT_FORMAT_META,
  type GeoExportFormat,
} from '@hungpvq/map-dataset/geo-export';
import { MapControlButton } from '@hungpvq/react-map-core';
import { InputCheckbox, InputSelect, InputText } from '@hungpvq/react-map-core/fields';
import { useState, type MouseEvent } from 'react';

export function AttributeTableToolbar(props: AttributeTableToolbarProps) {
  const ui = resolveAttributeTableUi(props.ui);
  const [menuOpen, setMenuOpen] = useState(false);
  const formatItems = (props.exportFormats ?? []).map((fmt) => ({
    value: fmt,
    text: GEO_EXPORT_FORMAT_META[fmt as GeoExportFormat]?.name ?? String(fmt),
  }));

  function onExportClick(event: MouseEvent) {
    if (props.exportFormats?.length && props.onExportFormat) {
      setMenuOpen((open) => !open);
      return;
    }
    props.onExport?.(event.nativeEvent);
  }

  return (
    <div className="attribute-table__toolbar">
      <div className="attribute-table__toolbar-row attribute-table__toolbar-row--primary">
        {ui.search ? (
          <InputText
            value={props.query}
            placeholder={props.searchPlaceholder}
            aria-label={props.searchLabel}
            onChange={props.onQueryChange}
          />
        ) : null}
        {ui.export && (props.onExport || props.onExportFormat) ? (
          <div className="attribute-table__export">
            <MapControlButton
              variant="outlined"
              size="medium"
              onClick={onExportClick}
            >
              {props.exportLabel || 'Export'}
            </MapControlButton>
            {menuOpen && formatItems.length ? (
              <ul className="attribute-table__export-menu" role="menu">
                {formatItems.map((item) => (
                  <li
                    key={String(item.value)}
                    role="menuitem"
                    onClick={(event) => {
                      setMenuOpen(false);
                      props.onExportFormat?.(
                        String(item.value),
                        event.nativeEvent,
                      );
                    }}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
      {ui.zoomToSelection || ui.rowFilter || ui.clearSelection ? (
        <div className="attribute-table__toolbar-row attribute-table__toolbar-row--meta">
          {ui.zoomToSelection ? (
            <InputCheckbox
              checked={props.zoomToSelection}
              label={props.zoomLabel}
              onChange={props.onZoomToSelectionChange}
            />
          ) : null}
          {ui.rowFilter ? (
            <InputSelect
              value={props.rowFilter}
              items={props.filterItems}
              aria-label={props.rowFilterLabel}
              onChange={(value) =>
                props.onRowFilterChange(
                  value === 'selected' ? 'selected' : 'all',
                )
              }
            />
          ) : null}
          {ui.clearSelection ? (
            <MapControlButton
              className="attribute-table__clear"
              disabled={props.clearDisabled}
              variant="outlined"
              size="medium"
              onClick={props.onClearSelection}
            >
              {props.clearLabel}
            </MapControlButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
