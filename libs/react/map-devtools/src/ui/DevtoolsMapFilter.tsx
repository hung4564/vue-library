import { listMapIds, shortMapId } from '@hungpvq/map-debug';
import { InputSelect } from '@hungpvq/react-map-core/fields';
import { useEffect, useMemo, useState } from 'react';
import { setDevtoolFilterMapId } from '../store';
import { useDevtoolState } from '../useDevtoolState';

const ALL = 'all';

export function DevtoolsMapFilter() {
  const { filterMapId } = useDevtoolState();
  const [mapIds, setMapIds] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => setMapIds(listMapIds());
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (filterMapId !== ALL && !mapIds.includes(filterMapId)) {
      setDevtoolFilterMapId(ALL);
    }
  }, [filterMapId, mapIds]);

  const items = useMemo(
    () => [
      { value: ALL, text: 'All maps' },
      ...mapIds.map((id) => ({ value: id, text: shortMapId(id) })),
    ],
    [mapIds],
  );

  if (mapIds.length <= 1) return null;

  return (
    <div
      className="devtools-map-filter"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <InputSelect
        aria-label="Filter by mapId"
        value={filterMapId}
        items={items}
        onChange={(value) => setDevtoolFilterMapId(String(value ?? ALL))}
      />
    </div>
  );
}
