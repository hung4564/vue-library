import { DefaultBaseMapAdapter as CoreDefaultBaseMapAdapter } from '@hungpvq/map-core';
import { getMap } from '../../../store/store';

export { BaseMapAdapter } from '@hungpvq/map-core';

export class DefaultBaseMapAdapter extends CoreDefaultBaseMapAdapter {
  constructor() {
    super(getMap);
  }
}
