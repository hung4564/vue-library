// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  getFunctionsSideBar,
  type PackageIndexes,
} from '../../../docs/metadata';
import _metadata, { functions as _functions } from './metadata.json';
export const metadata = _metadata as PackageIndexes;
export const functions = _functions as PackageIndexes['functions'];

export const SharedFunctionsSideBar = getFunctionsSideBar(metadata, 'Share');
