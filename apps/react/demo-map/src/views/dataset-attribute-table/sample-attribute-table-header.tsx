import type { AttributeTableHeaderProps } from '@hungpvq/map-dataset/attribute-table';

export function SampleAttributeTableHeader(props: AttributeTableHeaderProps) {
  const sortSuffix = (() => {
    if (!props.sortable || !props.sortDir) return '';
    const arrow = props.sortDir === 'asc' ? ' ↑' : ' ↓';
    const order =
      props.sortCount && props.sortCount > 1 && props.sortOrder
        ? String(props.sortOrder)
        : '';
    return `${arrow}${order}`;
  })();

  return (
    <button
      type="button"
      className="at-sample-header"
      disabled={!props.sortable}
      title={
        props.sortable
          ? 'Click to sort · Shift+click for multi-sort'
          : 'Sorting disabled for this column'
      }
      onClick={(event) => {
        event.stopPropagation();
        if (!props.sortable || !props.onSort) return;
        props.onSort(event.shiftKey);
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        maxWidth: '100%',
        margin: 0,
        padding: 0,
        border: 0,
        background: 'transparent',
        font: 'inherit',
        color: 'inherit',
        textAlign: 'left',
        cursor: props.sortable ? 'pointer' : 'default',
        opacity: props.sortable ? 1 : 0.75,
      }}
    >
      <span
        style={{
          fontWeight: 700,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          fontSize: '0.78em',
          color: 'var(--map-accent-color, #1a73e8)',
        }}
      >
        {props.label}
      </span>
      {sortSuffix ? (
        <span style={{ fontWeight: 600, opacity: 0.85 }}>{sortSuffix}</span>
      ) : props.sortable ? (
        <span style={{ fontWeight: 600, opacity: 0.45 }}>⇅</span>
      ) : null}
    </button>
  );
}
