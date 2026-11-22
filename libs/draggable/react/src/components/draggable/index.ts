import { WithMobileHandle } from '../../hoc/mobile-handle';
import { DraggableContainer } from './draggable-container';
import { DraggableItemBottom } from './item-bottom';
import { DraggableItemDrawer } from './item-drawer';
import { DraggableItemFloat } from './item-float';
import { DraggableItemModal as DraggableModalOrigin } from './item-modal';
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
const DraggableDrawerWithMobile = WithMobileHandle(
  DraggableItemDrawer,
  DraggableItemBottom,
);

export {
  DraggableContainer,
  DraggableItemBottom,
  DraggableDrawerWithMobile as DraggableItemDrawer,
  DraggableItemFloatWithMobile as DraggableItemFloat,
  DraggableModalOrigin as DraggableItemModal,
  DraggableItemPopupWithMobile as DraggableItemPopup,
  DraggableItemSideBarWithMobile as DraggableItemSideBar,
};
