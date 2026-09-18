import type { MapDrawDraftOption, MapDrawOption } from './types';

export function isDraftOption(
  opt?: Partial<MapDrawOption>,
): opt is MapDrawDraftOption {
  return !!opt && 'draft' in opt;
}
