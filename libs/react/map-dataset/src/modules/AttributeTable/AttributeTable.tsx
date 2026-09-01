import { fitBounds, getMap, type WithMapPropType } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  buildAttributeTable,
  filterAttributeTableRows,
  getDatasetFeatureCollection,
  type AttributeTableColumn,
  type AttributeTableRow,
} from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  InputText,
  ModuleContainer,
  defaultMapProps,
  useLang,
  useMap,
} from '@hungpvq/react-map-core';
import type { Feature } from 'geojson';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMapDatasetHighlight } from '../../store';

type AttributeTableProps = WithMapPropType & {
  layer: IDataset;
  onClose?: () => void;
};

export function AttributeTable(props: AttributeTableProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps } = useMap(merged);
  const { setFeatureHighlight, getHighlightSource } =
    useMapDatasetHighlight(mapId);
  const setFeatureHighlightRef = useRef(setFeatureHighlight);
  const getHighlightSourceRef = useRef(getHighlightSource);
  setFeatureHighlightRef.current = setFeatureHighlight;
  getHighlightSourceRef.current = getHighlightSource;
  const { trans, setLocaleDefault } = useLang(mapId);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [columns, setColumns] = useState<AttributeTableColumn[]>([]);
  const [rows, setRows] = useState<AttributeTableRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>();

  useEffect(() => {
    setLocaleDefault({
      map: {
        'attribute-table': {
          title: 'Attribute table',
          search: 'Search',
          empty: 'No features',
          loading: 'Loading…',
        },
      },
    });
  }, [setLocaleDefault]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const collection = await getDatasetFeatureCollection(props.layer);
        if (cancelled) return;
        if (!collection) {
          setColumns([]);
          setRows([]);
          return;
        }
        const table = buildAttributeTable(collection);
        setColumns(table.columns);
        setRows(table.rows);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (getHighlightSourceRef.current() === 'attribute-table') {
        setFeatureHighlightRef.current(undefined, 'attribute-table');
      }
    };
  }, [props.layer]);

  const visibleRows = useMemo(
    () => filterAttributeTableRows(rows, query),
    [rows, query],
  );

  const title = useMemo(() => {
    const name =
      props.layer?.getName?.() || trans('map.attribute-table.title');
    return rows.length ? `${name} (${rows.length})` : trans('map.attribute-table.title');
  }, [props.layer, rows.length, trans]);

  function handleClose() {
    if (getHighlightSource() === 'attribute-table') {
      setFeatureHighlight(undefined, 'attribute-table');
    }
    props.onClose?.();
  }

  function onSelectRow(row: AttributeTableRow) {
    setSelectedId(row.id);
    const feature = row.feature as Feature;
    setFeatureHighlight(feature, 'attribute-table', props.layer);
    getMap(mapId, (map) => {
      fitBounds(map, feature);
    });
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) => (
        <DraggableItemPopup
          show
          width={720}
          height={420}
          title={title}
          onClose={handleClose}
          onUpdateShow={(v) => {
            if (!v) handleClose();
          }}
          {...bind}
        >
          <div className="attribute-table">
            <div className="attribute-table__toolbar">
              <InputText
                value={query}
                placeholder={trans('map.attribute-table.search')}
                onChange={setQuery}
              />
            </div>
            {loading ? (
              <div className="attribute-table__status">
                {trans('map.attribute-table.loading')}
              </div>
            ) : visibleRows.length === 0 ? (
              <div className="attribute-table__status">
                {trans('map.attribute-table.empty')}
              </div>
            ) : (
              <div className="attribute-table__scroll">
                <table className="attribute-table__table">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr
                        key={row.id}
                        className={row.id === selectedId ? 'is-selected' : ''}
                        onClick={() => onSelectRow(row)}
                      >
                        {columns.map((column) => {
                          const value = row.cells[column.key] ?? '';
                          return (
                            <td
                              key={column.key}
                              title={value.length > 80 ? value : undefined}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DraggableItemPopup>
      )}
    />
  );
}
