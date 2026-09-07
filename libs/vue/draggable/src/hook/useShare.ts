import { withShareComponent } from './useComponent';

export const withShareProps = {
  id: String,
  disabledExpand: Boolean,
  disabledHeader: Boolean,
  disabledClose: Boolean,
  disabledOrder: Boolean,
  containerId: String,
  highlightMs: {
    type: Number,
    default: undefined,
  },
  title: {
    type: String,
    default: '',
  },
  ...withShareComponent,
};
