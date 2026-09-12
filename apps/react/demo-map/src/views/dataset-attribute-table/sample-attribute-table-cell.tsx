import type { AttributeTableCellProps } from '@hungpvq/map-dataset/attribute-table';

export function SampleAttributeTableCell(props: AttributeTableCellProps) {
  return (
    <span
      className="at-sample-cell"
      title={props.raw == null ? '' : String(props.raw)}
      style={{
        display: 'inline-block',
        maxWidth: '100%',
        padding: '1px 6px',
        borderRadius: 4,
        background:
          'color-mix(in srgb, var(--map-accent-color, #1a73e8) 14%, transparent)',
        color: 'var(--map-accent-color, #1a73e8)',
        fontSize: '0.85em',
        fontWeight: 600,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
      }}
    >
      {props.value || '—'}
    </span>
  );
}
