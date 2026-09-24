import type { IDraftRecord } from '@hungpvq/map-draw';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  MapControlButton,
  useLang,
  useRegisterMapControl,
} from '@hungpvq/react-map-core';
import { mdiCrosshairsGps, mdiDeleteOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import type { Feature } from 'geojson';

export interface DrawDraftListProps {
  show: boolean;
  setShow: (value: boolean) => void;
  draftItems: IDraftRecord[];
  mapId: string;
  onFlyTo: (feature: Feature) => void;
  onDiscardItem: (item: IDraftRecord) => void;
  /** ModuleContainer bindDrag spread onto popup position */
  bindDrag?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    containerId: string;
  };
}

/** Registers `mapDrawDraftList` and renders the draft popup table (Vue parity). */
export function DrawDraftList({
  show,
  setShow,
  draftItems,
  mapId,
  onFlyTo,
  onDiscardItem,
  bindDrag,
}: DrawDraftListProps) {
  const { trans } = useLang(mapId);
  const { panelBind } = useRegisterMapControl(mapId, {
    id: 'mapDrawDraftList',
    panelKind: 'popup',
    title: trans('map.draw-control.draftList.title'),
    show,
    setShow,
    actions: [
      {
        type: 'mapDrawDraftList',
        run: () => {
          setShow(!show);
        },
      },
    ],
  });

  return (
    <DraggableItemPopup
      height={400}
      width={400}
      {...(bindDrag ?? {})}
      {...panelBind}
      show={show}
      onUpdateShow={setShow}
      title={trans('map.draw-control.draftList.title')}
    >
      <table className="draft-items-table">
        <thead>
          <tr>
            <th className="table-col-id">
              {trans('map.draw-control.draftList.field.id')}
            </th>
            <th className="table-col-type">
              {trans('map.draw-control.draftList.field.type')}
            </th>
            <th className="table-col-action">
              {trans('map.draw-control.draftList.field.action')}
            </th>
          </tr>
        </thead>
        <tbody>
          {draftItems.length === 0 ? (
            <tr>
              <td colSpan={3} className="table-col-empty">
                {trans('map.draw-control.draftList.empty')}
              </td>
            </tr>
          ) : (
            draftItems.map((item) => (
              <tr key={String(item.id)}>
                <td title={String(item.id)} className="table-col-id">
                  {item.id}
                </td>
                <td className="table-col-type">
                  {trans(`map.draw-control.draftList.type.${item.status}`)}
                </td>
                <td className="table-col-action">
                  {item.modified ? (
                    <MapControlButton
                      variant="plain"
                      type="button"
                      className="menu-item"
                      title={trans(
                        'map.draw-control.draftList.action.fillBound',
                      )}
                      onClick={() => onFlyTo(item.modified as Feature)}
                    >
                      <Icon path={mdiCrosshairsGps} size="16px" />
                    </MapControlButton>
                  ) : null}
                  <MapControlButton
                    variant="plain"
                    type="button"
                    className="menu-item"
                    title={trans('map.draw-control.draftList.action.discard')}
                    onClick={() => onDiscardItem(item)}
                  >
                    <Icon path={mdiDeleteOutline} size="16px" />
                  </MapControlButton>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </DraggableItemPopup>
  );
}
