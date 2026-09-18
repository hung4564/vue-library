import {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  type AttributeTableViewProps,
} from '@hungpvq/map-dataset/attribute-table';
import { MapControlButton } from '@hungpvq/react-map-core';
import { useEffect, useState } from 'react';

export function SampleAttributeTableView(props: AttributeTableViewProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    return props.controller.subscribe(() => setTick((v) => v + 1));
  }, [props.controller]);

  const state = props.controller.getState();
  const selected = new Set(state.selectedIds);

  function onRowClick(id: string) {
    void props.controller.selectIds(
      selected.has(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id],
    );
  }

  return (
    <div className="sample-at-view">
      <div className="sample-at-view__banner">
        <code>{ATTRIBUTE_TABLE_COMPONENT_KEY.view}</code>
        {' · replaces toolbar + grid + pager'}
      </div>
      <div className="sample-at-view__toolbar">
        <input
          value={state.search}
          placeholder={props.labels.search}
          onChange={(e) => props.controller.setSearch(e.target.value)}
        />
        <MapControlButton
          variant="outlined"
          size="small"
          onClick={() => props.controller.clearSelection()}
        >
          {props.labels.clear}
        </MapControlButton>
        <MapControlButton
          variant="outlined"
          size="small"
          onClick={(e) => props.onExportClick(e.nativeEvent)}
        >
          {state.selectedIds.length
            ? props.labels.exportSelected
            : props.labels.export}
        </MapControlButton>
      </div>
      {state.loading ? (
        <div className="sample-at-view__status">{props.labels.loading}</div>
      ) : !state.rows.length ? (
        <div className="sample-at-view__status">{props.labels.empty}</div>
      ) : (
        <table className="sample-at-view__table">
          <thead>
            <tr>
              <th />
              {state.columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row) => (
              <tr
                key={row.id}
                className={selected.has(row.id) ? 'is-selected' : undefined}
                onClick={() => onRowClick(row.id)}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(row.id);
                    }}
                    onChange={() => undefined}
                  />
                </td>
                {state.columns.map((col) => (
                  <td key={col.key}>{row.cells[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="sample-at-view__pager">
        <span>
          {props.labels.page} {state.page} {props.labels.of}{' '}
          {props.controller.getTotalPages()}
        </span>
        <MapControlButton
          variant="outlined"
          size="small"
          disabled={!props.controller.canPrev()}
          onClick={() => {
            void props.controller.goPrev();
          }}
        >
          {props.labels.prev}
        </MapControlButton>
        <MapControlButton
          variant="outlined"
          size="small"
          disabled={!props.controller.canNext()}
          onClick={() => {
            void props.controller.goNext();
          }}
        >
          {props.labels.next}
        </MapControlButton>
      </div>
      <style>{`
        .sample-at-view {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          font-size: 12px;
        }
        .sample-at-view__banner {
          padding: 4px 10px;
          background: #f3f0e8;
          border-bottom: 1px solid #d9d0bc;
          color: #3d3426;
        }
        .sample-at-view__banner code { font-size: 10px; }
        .sample-at-view__toolbar {
          display: flex;
          gap: 8px;
          padding: 8px 10px;
          border-bottom: 1px solid #e5e5e5;
        }
        .sample-at-view__toolbar input {
          flex: 1;
          min-width: 0;
          padding: 4px 8px;
        }
        .sample-at-view__status {
          padding: 24px;
          text-align: center;
          opacity: 0.7;
        }
        .sample-at-view__table {
          flex: 1;
          width: 100%;
          border-collapse: collapse;
          overflow: auto;
          display: block;
        }
        .sample-at-view__table th,
        .sample-at-view__table td {
          padding: 4px 8px;
          border-bottom: 1px solid #eee;
          text-align: left;
          white-space: nowrap;
        }
        .sample-at-view__table tr.is-selected { background: #e8f1fb; }
        .sample-at-view__pager {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-top: 1px solid #e5e5e5;
        }
      `}</style>
    </div>
  );
}
