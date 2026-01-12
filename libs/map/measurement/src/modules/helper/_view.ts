/* eslint-disable  @typescript-eslint/no-unused-vars */

import type { IViewSetting } from '@hungpvq/map-core';
import type { IView, IViewProps } from '../types';

export class View implements IView {
  start(_props?: IViewProps) {
    return;
  }
  view(_props: IViewProps) {
    return;
  }
  reset() {
    return;
  }
  destroy() {
    return;
  }
}
