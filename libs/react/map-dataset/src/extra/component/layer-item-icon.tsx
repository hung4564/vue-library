import { mdiLayers, mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';

const ICON_SIZE = '14px';

export function LayerItemIcon({ loading }: { loading?: boolean }) {
  return (
    <div className="layer-item__icon-content">
      {loading ? (
        <Icon path={mdiLoading} size={ICON_SIZE} className="spin" />
      ) : (
        <Icon path={mdiLayers} size={ICON_SIZE} />
      )}
    </div>
  );
}
