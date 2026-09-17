import type { IDraftRecord } from '@hungpvq/map-draw';
import { useRegisterMapControl } from '@hungpvq/react-map-core';

export interface DrawDraftListProps {
  show: boolean;
  setShow: (value: boolean) => void;
  draftItems: { id: string | number; status: string }[];
  draftCounts: number;
  mapId: string;
  onDiscardItem: (item: IDraftRecord) => void;
}

/** Registers `mapDrawDraftList` (always mount from DrawControl). */
export function DrawDraftList({
  show,
  setShow,
  draftCounts,
  mapId,
}: Pick<
  DrawDraftListProps,
  'show' | 'setShow' | 'draftCounts' | 'mapId'
>) {
  useRegisterMapControl(mapId, {
    id: 'mapDrawDraftList',
    panelKind: 'popup',
    title: 'Draft items',
    show,
    setShow,
    getProps: () => ({ draftCounts }),
    actions: [{ type: 'mapDrawDraftList', run: () => setShow(true) }],
  });

  return null;
}

/** Draft list panel UI (ModuleContainer `draggable` portal). */
export function DrawDraftListPanel({
  draftItems,
  draftCounts,
  onDiscardItem,
  onClose,
}: {
  draftItems: DrawDraftListProps['draftItems'];
  draftCounts: number;
  onDiscardItem: DrawDraftListProps['onDiscardItem'];
  onClose: () => void;
}) {
  return (
    <div className="map-draw-draft-list">
      <strong>Draft items ({draftCounts})</strong>
      <ul>
        {draftItems.map((item) => (
          <li key={String(item.id)}>
            {String(item.id)} — {item.status}{' '}
            <button
              type="button"
              onClick={() => onDiscardItem(item as IDraftRecord)}
            >
              Discard
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
