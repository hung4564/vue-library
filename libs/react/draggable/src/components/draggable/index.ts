import { WithMobileHandle } from '../../hoc/mobile-handle';
import { DraggableContainer } from './draggable-container';
import { DraggableItemBottom } from './item-bottom';
import { DraggableDrawer } from './item-drawer';
import { DraggableItemFloat } from './item-float';
import { DraggableModal as DraggableModalOrigin } from './item-modal';
import { DraggableItemPopup } from './item-popup';
import { DraggableItemSideBar } from './item-sidebar';

const DraggableItemSideBarWithMobile = WithMobileHandle(
  DraggableItemSideBar,
  DraggableItemBottom,
);
const DraggableItemPopupWithMobile = WithMobileHandle(
  DraggableItemPopup,
  DraggableItemBottom,
);
const DraggableItemFloatWithMobile = WithMobileHandle(
  DraggableItemFloat,
  DraggableItemBottom,
);
const DraggableModalWithMobile = WithMobileHandle(
  DraggableModalOrigin,
  DraggableItemBottom,
);
const DraggableDrawerWithMobile = WithMobileHandle(
  DraggableDrawer,
  DraggableItemBottom,
);

export {
  DraggableContainer,
  DraggableDrawerWithMobile as DraggableDrawer,
  DraggableItemBottom,
  DraggableItemFloatWithMobile as DraggableItemFloat,
  DraggableItemPopupWithMobile as DraggableItemPopup,
  DraggableItemSideBarWithMobile as DraggableItemSideBar,
  DraggableModalWithMobile as DraggableModal,
};
