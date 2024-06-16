import { PackageIndexes } from './types';

import { functions as functions_draggable } from '../../../libs/draggable/metadata';
import { functions as functions_map } from '../../../libs/map-core/metadata';
import { functions as functions_shared } from '../../../libs/shared/metadata';
export const functions = functions_shared
  .concat(functions_draggable)
  .concat(functions_map) as PackageIndexes['functions'];
