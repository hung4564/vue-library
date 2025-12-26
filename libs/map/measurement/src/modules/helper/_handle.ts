import { type CoordinatesNumber } from '@hungpvq/shared-map';
import { IView, IViewProps } from '../types';
import { Measure } from './_measurement';

export const MeasurementHandle = function () {
  let _action: Measure | null = null;
  const _views: IView[] = [];
  let _mapId = '';

  const setMapId = (mapId: string) => {
    _mapId = mapId;
  };

  const withView = (wv: (_view: IView) => void) => {
    for (let i = 0; i < _views.length; i++) wv(_views[i]);
  };
  const setAction = (action: Measure | null) => {
    _action = action;
  };
  const addView = (view: IView) => {
    _views.push(view);
  };
  const start = () => {
    if (_action) _action.start();
    withView((view) => {
      if (view.start) view.start(getResult());
    });
  };
  const reset = () => {
    if (_action) _action.reset();
    withView((view) => {
      if (view.reset) view.reset();
    });
  };
  const destroy = () => {
    if (_action) _action.destroy();
    withView((view) => {
      view.destroy();
    });
  };
  const getResult = (): IViewProps => {
    if (!_action) return { mapId: _mapId };
    return {
      mapId: _mapId,
      coordinates: _action.value,
      setting: _action.setting,
      ..._action.getResult(),
    };
  };
  const add = (point: CoordinatesNumber) => {
    if (_action) _action.add(point);
    withView((view) => {
      if (view.view) view.view(getResult());
    });
  };
  const init = (points: CoordinatesNumber[] = []) => {
    if (_action) _action.init(points);
    withView((view) => {
      view.view(getResult());
    });
  };
  return {
    get type() {
      if (!_action) return null;
      return _action.type;
    },
    get action() {
      return _action;
    },
    setAction,
    addView,
    start,
    reset,
    destroy,
    add,
    init,
    getResult,
    setMapId,
  };
};
export type MeasurementHandleType = ReturnType<typeof MeasurementHandle>;
