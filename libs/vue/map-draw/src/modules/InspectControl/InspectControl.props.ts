import type { WithMapPropType } from '@hungpvq/map-core';
import type { InspectControllerOptions } from '@hungpvq/map-draw';

export interface InspectControlProps extends WithMapPropType {
  mapId?: string;
  dragId?: string;
  btnWidth?: number;
  position?: WithMapPropType['position'];
  controlVisible?: boolean;
  showInspectDefault?: boolean;
  useInspectStyle?: boolean;
  showInspectMapPopup?: boolean;
  showInspectMapPopupOnHover?: boolean;
  showMapPopup?: boolean;
  showMapPopupOnHover?: boolean;
  blockHoverPopupOnClick?: boolean;
  buildInspectStyle?: InspectControllerOptions['buildInspectStyle'];
  backgroundColor?: string;
  assignLayerColor?: InspectControllerOptions['assignLayerColor'];
  renderPopup?: InspectControllerOptions['renderPopup'];
  selectThreshold?: number;
  queryParameters?: InspectControllerOptions['queryParameters'];
}
