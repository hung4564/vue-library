import {
  getDatasetSourceKind,
  type DatasetSourceKind,
  type IDataset,
} from '@hungpvq/map-dataset';
import {
  mdiCheckerboard,
  mdiLayers,
  mdiLoading,
  mdiVectorPolygon,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useMemo } from 'react';

const ICON_SIZE = '14px';

const PATH: Record<DatasetSourceKind, string> = {
  vector: mdiVectorPolygon,
  raster: mdiCheckerboard,
  unknown: mdiLayers,
};

const KIND_TITLE: Partial<Record<DatasetSourceKind, string>> = {
  vector: 'Vector',
  raster: 'Raster',
};

export function LayerItemIcon({
  loading,
  data,
  item,
}: {
  loading?: boolean;
  data?: IDataset;
  item?: IDataset;
}) {
  const kind = useMemo(
    () => getDatasetSourceKind(data ?? item),
    [data, item],
  );
  const className = [
    'layer-item__icon-content',
    kind !== 'unknown' ? `layer-item__icon-content--${kind}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} title={KIND_TITLE[kind]}>
      {loading ? (
        <Icon path={mdiLoading} size={ICON_SIZE} className="spin" />
      ) : (
        <Icon path={PATH[kind]} size={ICON_SIZE} />
      )}
    </div>
  );
}
