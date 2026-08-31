import type {
  CoordinatesNumber,
  IViewProps,
  IViewSetting,
  IViewSettingField,
} from '../../types';
import { View } from './view';

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
  override start(_props?: FormViewProps) {
    const { setting } = (_props || {}) as FormViewProps;
    if (this.onChangeSetting) {
      this.onChangeSetting(setting);
    }
  }
  override view(_props: FormViewViewProps) {
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
  override reset() {
    if (this.onChangeValue) {
      this.onChangeValue([]);
    }
    if (this.onChangeSetting) {
      this.onChangeSetting();
    }
  }
}
