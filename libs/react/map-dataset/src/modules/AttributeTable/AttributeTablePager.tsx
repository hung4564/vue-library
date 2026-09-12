import {
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  type AttributeTablePagerProps,
} from '@hungpvq/map-dataset/attribute-table';
import { MapControlButton } from '@hungpvq/react-map-core';
import { InputSelect } from '@hungpvq/react-map-core/fields';

export function AttributeTablePager(props: AttributeTablePagerProps) {
  if (props.total <= 0) return null;

  const pageSizeItems = props.pageSizeItems?.length
    ? props.pageSizeItems
    : [...ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS];

  const pageStatus = `${props.pageLabel} ${props.page} ${props.ofLabel} ${props.totalPages}`;

  return (
    <div className="attribute-table__pager">
      <span
        className="attribute-table__pager-label"
        role="status"
        aria-live="polite"
      >
        {pageStatus}
      </span>
      <MapControlButton
        className="attribute-table__pager-btn"
        disabled={!props.canPrev || props.loading}
        variant="outlined"
        size="medium"
        onClick={props.onPrev}
      >
        {props.prevLabel}
      </MapControlButton>
      <MapControlButton
        className="attribute-table__pager-btn"
        disabled={!props.canNext || props.loading}
        variant="outlined"
        size="medium"
        onClick={props.onNext}
      >
        {props.nextLabel}
      </MapControlButton>
      <div className="attribute-table__pager-size">
        <span className="attribute-table__pager-size-label">
          {props.rowsPerPageLabel}
        </span>
        <InputSelect
          value={props.pageSize}
          items={pageSizeItems}
          label={props.rowsPerPageLabel}
          aria-label={props.rowsPerPageLabel}
          onChange={(value) => {
            props.onPageSizeChange(value);
          }}
        />
      </div>
    </div>
  );
}
