import type { LayerSpecification, SourceSpecification } from 'maplibre-gl';
import type {
  IDataset,
  IFieldInfo,
  IMapboxLayerView,
  IMapboxSourceView,
} from '../../interfaces';
import type { IListViewUI } from '../../model/list/types';
import { findSiblingOrNearestLeaf } from '../../model/visitors';
import { getDatasetSourceKind } from '../../utils/source-kind';

export type DatasetDetailInfo = {
  item: Record<string, unknown>;
  fields: IFieldInfo[];
};

const FIELD = {
  name: { trans: 'map.layer-control.field.name', value: 'name' },
  id: { trans: 'map.layer-control.field.id', value: 'id' },
  kind: { trans: 'map.layer-control.field.kind', value: 'kind' },
  color: { trans: 'map.layer-control.field.color', value: 'color' },
  opacity: { trans: 'map.layer-control.field.opacity', value: 'opacity' },
  visible: { trans: 'map.layer-control.field.visible', value: 'visible' },
  layerIds: { trans: 'map.layer-control.field.layer-ids', value: 'layerIds' },
  layerTypes: {
    trans: 'map.layer-control.field.layer-types',
    value: 'layerTypes',
  },
  sourceLayer: {
    trans: 'map.layer-control.field.source-layer',
    value: 'sourceLayer',
  },
  filter: { trans: 'map.layer-control.field.filter', value: 'filter' },
  layers: {
    trans: 'map.layer-control.field.layers',
    value: 'layers',
    inline: true,
  },
} as const satisfies Record<string, IFieldInfo>;

function formatDisplay(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (
      value.length > 0 &&
      value.every((item) => ['string', 'number', 'boolean'].includes(typeof item))
    ) {
      return value.join(', ');
    }
    return JSON.stringify(value, undefined, 2);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, undefined, 2);
  }
  return String(value);
}

function pushField(
  out: DatasetDetailInfo,
  field: IFieldInfo,
  value: unknown,
) {
  const display = formatDisplay(value);
  if (display === '') return;
  if (out.item[field.value] != null) return;
  out.item[field.value] = display;
  out.fields.push(field);
}

function findSource(dataset: IDataset): IMapboxSourceView | undefined {
  const source = findSiblingOrNearestLeaf(
    dataset,
    (node) => node.type === 'source',
  ) as IMapboxSourceView | undefined;
  if (!source || typeof source.getMapboxSource !== 'function') return undefined;
  return source;
}

function findLayerView(
  dataset: IDataset,
): (IDataset & IMapboxLayerView) | undefined {
  return findSiblingOrNearestLeaf(
    dataset,
    (node) => node.type === 'layer',
  ) as (IDataset & IMapboxLayerView) | undefined;
}

function kindLabel(dataset: IDataset): string | undefined {
  const kind = getDatasetSourceKind(dataset);
  if (kind === 'vector') return 'Vector';
  if (kind === 'raster') return 'Raster';
  return undefined;
}

function readLayers(dataset: IDataset): LayerSpecification[] {
  const layerView = findLayerView(dataset);
  if (!layerView || typeof layerView.getLayers !== 'function') return [];
  try {
    return layerView.getLayers() ?? [];
  } catch {
    return [];
  }
}

function readSourceSpec(
  source: IMapboxSourceView,
): (SourceSpecification & { id?: string }) | undefined {
  try {
    return source.getMapboxSource();
  } catch {
    return undefined;
  }
}

/** Layer + source fields for the Info popup (`createMenuItemShowDetailInfoSource`). */
export function getDatasetDetailInfo(dataset: IDataset): DatasetDetailInfo {
  const out: DatasetDetailInfo = { item: {}, fields: [] };
  const list = dataset as IListViewUI;
  const layers = readLayers(dataset);

  pushField(out, FIELD.name, dataset.getName?.());
  pushField(out, FIELD.id, dataset.id);
  pushField(out, FIELD.kind, kindLabel(dataset));
  pushField(out, FIELD.color, list.color);
  pushField(out, FIELD.opacity, list.opacity);
  pushField(out, FIELD.visible, list.show);
  pushField(
    out,
    FIELD.layerIds,
    layers.map((layer) => layer.id).filter(Boolean),
  );
  pushField(
    out,
    FIELD.layerTypes,
    [...new Set(layers.map((layer) => layer.type))],
  );
  pushField(
    out,
    FIELD.sourceLayer,
    [
      ...new Set(
        layers
          .map((layer) => ('source-layer' in layer ? layer['source-layer'] : ''))
          .filter(Boolean),
      ),
    ],
  );
  pushField(
    out,
    FIELD.filter,
    layers
      .map((layer) => layer.filter)
      .filter(Boolean)
      .map((filter) => JSON.stringify(filter)),
  );

  const source = findSource(dataset);
  if (source) {
    let dataInfo: Record<string, unknown> = {};
    try {
      dataInfo = (source.getDataInfo?.() as Record<string, unknown>) ?? {};
    } catch {
      dataInfo = {};
    }
    const sourceFields = source.getFieldsInfo?.() ?? [];
    for (const field of sourceFields) {
      pushField(out, field, dataInfo[field.value]);
    }

    const spec = readSourceSpec(source);
    if (spec) {
      pushField(
        out,
        { trans: 'map.layer-control.field.source-id', value: 'sourceId' },
        source.getSourceId?.() ?? spec.id,
      );
      if ('url' in spec) {
        pushField(
          out,
          { trans: 'map.layer-control.field.url', value: 'url', inline: true },
          spec.url,
        );
      }
      if ('tiles' in spec) {
        pushField(
          out,
          {
            trans: 'map.layer-control.field.tiles',
            value: 'tiles',
            inline: true,
          },
          spec.tiles,
        );
      }
      if ('tileSize' in spec) {
        pushField(
          out,
          { trans: 'map.layer-control.field.tile-size', value: 'tileSize' },
          spec.tileSize,
        );
      }
      if ('minzoom' in spec) {
        pushField(
          out,
          { trans: 'map.layer-control.field.minzoom', value: 'minzoom' },
          spec.minzoom,
        );
      }
      if ('maxzoom' in spec) {
        pushField(
          out,
          { trans: 'map.layer-control.field.maxzoom', value: 'maxzoom' },
          spec.maxzoom,
        );
      }
      if ('scheme' in spec) {
        pushField(
          out,
          { trans: 'map.layer-control.field.scheme', value: 'scheme' },
          spec.scheme,
        );
      }
      if ('attribution' in spec) {
        pushField(
          out,
          {
            trans: 'map.layer-control.field.attribution',
            value: 'attribution',
          },
          spec.attribution,
        );
      }
      if ('bounds' in spec) {
        pushField(
          out,
          { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
          spec.bounds,
        );
      }
    }
  }

  if (layers.length > 0) {
    pushField(out, FIELD.layers, layers);
  }

  return out;
}
