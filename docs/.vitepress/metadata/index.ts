import { PackageIndexes } from './types';

import { functions as functions_shared } from '../../../libs/share/shared/metadata';
import { getFunctionsSideBar } from '../../metadata';
import metadata_draggable, {
  functions as functions_draggable,
} from './metadata_draggable.json';
import metadata_map, { functions as functions_map } from './metadata_map.json';
export const functions = functions_shared
  .concat(functions_draggable as any)
  .concat(functions_map as any) as PackageIndexes['functions'];

export const getDraggableSideBar = () =>
  getFunctionsSideBar(metadata_draggable as any, 'Draggable', {
    Draggable: {
      link: '/draggable/',
      text: 'Getting Started',
    },
  });

export const getMapSideBar = () =>
  getFunctionsSideBar(metadata_map as any, 'Map', {
    Map: {
      link: '/map/',
      text: 'Getting Started',
    },
  });
