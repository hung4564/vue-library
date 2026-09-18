import { createDefaultBaseMapAdapterClass } from '@hungpvq/map-core/basemap';
import { getMap } from '../../../store/store';

export const DefaultBaseMapAdapter = createDefaultBaseMapAdapterClass(getMap);
