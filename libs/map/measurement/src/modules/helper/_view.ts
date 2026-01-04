/* eslint-disable  @typescript-eslint/no-unused-vars */

import { IView, IViewProps, IViewSetting } from '../types';

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
