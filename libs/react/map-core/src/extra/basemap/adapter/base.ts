import {
  DefaultBaseMapAdapter as CoreDefaultBaseMapAdapter,
} from '@hungpvq/map-core/basemap';
import { getMap } from '../../../store/store';

export class DefaultBaseMapAdapter extends CoreDefaultBaseMapAdapter {
  constructor() {
    super(getMap);
  }
}
