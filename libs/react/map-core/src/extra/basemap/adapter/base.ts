import { DefaultBaseMapAdapter as CoreDefaultBaseMapAdapter } from '@hungpvq/map-core';
import { getMap } from '../../../store/store';

export class DefaultBaseMapAdapter extends CoreDefaultBaseMapAdapter {
  constructor() {
    super(getMap);
  }
}
