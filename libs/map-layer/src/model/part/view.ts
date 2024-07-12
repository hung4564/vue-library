import { ILayer, IView } from '@hungpvq/vue-map-core';

export type LayerBuildFunction<
  IReturn extends IView = IView,
  IOption extends object = any
> = {
  (layer: ILayer, option: IOption): IReturn;
};

export class LayerViewContainer {
  views: Record<string, IView> = {};
  addView(key: string, view: IView) {
    this.views[key] = view;
    return this;
  }
  getView<T extends IView = IView>(key: string): T {
    return this.views[key] as T;
  }
  runWithNameFunction(name_func: string, ...params: any[]) {
    const promises: Promise<any>[] = [];

    let { source: viewSource, ...rest } = this.views;
    if (name_func === 'addToMap') {
      if (viewSource && (viewSource as any)[name_func])
        promises.push((viewSource as any)[name_func](...params));
    } else if (name_func !== 'removeFromMap') {
      rest = this.views;
      viewSource = undefined as any;
    }
    withViews(
      rest,
      (view) => {
        if ((view as any)[name_func]) {
          promises.push((view as any)[name_func](...params));
        }
      },
      this
    );
    if (name_func === 'removeFromMap') {
      if (viewSource && (viewSource as any)[name_func])
        promises.push((viewSource as any)[name_func](...params));
    }
    return Promise.all(promises);
  }
}

function withViews(
  views: Record<string, IView>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cb = (view: IView) => {
    return;
  },
  bind: LayerViewContainer
): Promise<any> {
  return Promise.all(
    Object.keys(views).map((key) => {
      if (Object.hasOwnProperty.call(views, key)) {
        return cb.bind(bind)(views[key]);
      }
    })
  );
}
