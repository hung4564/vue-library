import { getUUIDv4 } from '@hungpv97/shared';
import { ILayer, IView, LayerBuildFunction } from '../types';

export class Base {
  _id: string;
  get id() {
    return this._id;
  }
  constructor() {
    this._id = `${getUUIDv4()}`;
  }
}
export abstract class ABuild<T = any, IBuildReturn extends IView = IView>
  implements IBuild
{
  key: string;
  option: T;
  build?: LayerBuildFunction<IBuildReturn>;
  constructor(key: string, option?: T, default_option?: Partial<T>) {
    this.key = key;
    this.option = Object.assign({}, default_option, option);
  }
  setBuild(build: any) {
    this.build = build;
    return this;
  }
}

export class AView extends Base implements IView {
  parent?: ILayer = undefined;
  data_id?: string;
  runAfterSetParent?: CallableFunction;
  setParent(_parent: ILayer) {
    this.parent = _parent;
    this.data_id = _parent.id;
    if (this.runAfterSetParent) {
      this.runAfterSetParent();
    }
  }
}

export type IBuild<T = any, IBuildReturn extends IView = IView> = {
  key: string;
  option?: T;
  build?: LayerBuildFunction<IBuildReturn>;
  setForLayer?: (layer: ILayer) => void;
};
