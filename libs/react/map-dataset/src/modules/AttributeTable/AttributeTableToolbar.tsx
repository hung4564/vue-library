import {
  resolveAttributeTableUi,
  type AttributeTableToolbarProps,
} from '@hungpvq/map-dataset/attribute-table';
import { MapControlButton } from '@hungpvq/react-map-core';
import { InputCheckbox, InputSelect, InputText } from '@hungpvq/react-map-core/fields';
import { mdiChevronDown, mdiDownload } from '@mdi/js';
import Icon from '@mdi/react';

export function AttributeTableToolbar(props: AttributeTableToolbarProps) {
  const ui = resolveAttributeTableUi(props.ui);
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
        {ui.export ? (
          <MapControlButton
            className="attribute-table__export"
            disabled={props.exportDisabled || props.exportLoading}
            loading={!!props.exportLoading}
            variant="outlined"
            size="medium"
            onClick={(event) => {
              event.stopPropagation();
              if (props.exportLoading) return;
              props.onExportClick(event.nativeEvent);
            }}
          >
            {!props.exportLoading ? (
              <Icon path={mdiDownload} size="16px" />
            ) : null}
            {props.exportLabel}
            {!props.exportLoading ? (
              <Icon path={mdiChevronDown} size="16px" />
            ) : null}
          </MapControlButton>
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
