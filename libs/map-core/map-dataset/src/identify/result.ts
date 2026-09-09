import type { IdentifyMultiResult, IIdentifyView } from '../interfaces';

/** Identify result panel registry actions (IdentifyResultControl). */
export const IDENTIFY_RESULT_CONTROL = {
  id: 'mapIdentifyResultControl',
  actionUpdate: 'update',
} as const;

export const IDENTIFY_ALL_LAYERS_VALUE = '__all__';

export type IdentifyResultGroupedItem = {
  id: string | number;
  name?: string;
  data: unknown;
  identify: IIdentifyView;
};

export type IdentifyResultGrouped = {
  id: string;
  name: string;
  items: IdentifyResultGroupedItem[];
};

export type IdentifyResultLayerItem = {
  value: string;
  text: string;
};

/** Payload for `IDENTIFY_RESULT_CONTROL.actionUpdate`. */
export type IdentifyResultUpdatePayload = {
  show?: boolean;
  loading?: boolean;
  items?: IdentifyResultGrouped[];
  origin?: { latitude: number; longitude: number };
  layerItems?: IdentifyResultLayerItem[];
  selectedLayerId?: string;
  isEventClickActive?: boolean;
  isEventClickBox?: boolean;
};

export function groupIdentifyResults(
  items: IdentifyMultiResult[],
): IdentifyResultGrouped[] {
  const groups: IdentifyResultGrouped[] = [];
  const groupExistingIds = new Map<string, Set<string | number>>();

  for (const item of items) {
    let group: IdentifyResultGrouped | undefined;
    const groupIdentify = item.identify.group;
    if (groupIdentify) {
      group = groups.find((g) => g.id === groupIdentify.id);
      if (!group) {
        group = { id: groupIdentify.id, name: groupIdentify.name, items: [] };
        groups.push(group);
      }
    } else {
      group = {
        id: item.identify.id,
        name: item.identify.getName(),
        items: [],
      };
      groups.push(group);
    }
    let existingIds = groupExistingIds.get(group.id);
    if (!existingIds) {
      existingIds = new Set<string | number>();
      groupExistingIds.set(group.id, existingIds);
    }

    for (const f of item.features) {
      const fid = f.id;
      if (!existingIds.has(fid)) {
        group.items.push({ ...f, identify: item.identify });
        existingIds.add(fid);
      }
    }
  }
  return groups;
}
