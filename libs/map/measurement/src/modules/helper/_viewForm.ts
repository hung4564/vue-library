import { type CoordinatesNumber } from '@hungpvq/shared-map';
import { IViewProps, IViewSetting, IViewSettingField } from '../types';

/* eslint-disable no-unused-vars */
import { View } from './_view';

type FormViewSetting = {
  fields?: IViewSettingField[];
  maxLength?: number;
};
type FormViewChangeSetting = (_setting?: FormViewSetting) => void;
type FormViewChangeValue = (_coordinates?: CoordinatesNumber[]) => void;

interface FormViewProps extends IViewProps {
  setting?: FormViewSetting;
}

interface FormViewViewProps extends IViewProps, IViewSetting {
  setting?: FormViewSetting;
}

export class FormView extends View {
  public onChangeSetting?: FormViewChangeSetting;
  public onChangeValue?: FormViewChangeValue;
  start(_props?: FormViewProps) {
    const { setting } = (_props || {}) as FormViewProps;
    if (this.onChangeSetting) {
      this.onChangeSetting(setting);
    }
  }
  view(_props: FormViewViewProps) {
    const {
      coordinates = [],
      setting = {},
      fields = [],
    } = _props as FormViewViewProps;
    if (this.onChangeValue) {
      this.onChangeValue(coordinates);
    }
    if (this.onChangeSetting) {
      setting.fields = fields;
      this.onChangeSetting(setting);
    }
  }
  reset() {
    if (this.onChangeValue) {
      this.onChangeValue([]);
    }
    if (this.onChangeSetting) {
      this.onChangeSetting();
    }
  }
}
