import { getUUIDv4 } from '@hungpvq/shared';
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
  key = '';
  option: Partial<T> = {};
  build!: LayerBuildFunction<IBuildReturn>;
  constructor(option: Partial<T> = {}, default_option?: Partial<T>) {
    this.option = Object.assign({}, default_option, option);
  }
  protected setBuild(build: LayerBuildFunction<IBuildReturn>) {
    this.build = build;
    return this;
  }
}

export class AView extends Base implements IView {
  parent?: ILayer = undefined;
  data_id?: string;
  setParent(_parent: ILayer) {
    this.parent = _parent;
    this.data_id = _parent.id;
  }
}

export type IBuild<T = any, IBuildReturn extends IView = IView> = {
  key: string;
  option?: T;
  build?: LayerBuildFunction<IBuildReturn>;
  setForLayer?: (layer: ILayer) => void;
};
