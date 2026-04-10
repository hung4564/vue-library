import { DraggableContainer } from './draggable-container';
import { DraggableItemBottom } from './item-bottom';
import { DraggableItemFloat } from './item-float';
import { DraggableItemPopup } from './item-popup';
import { DraggableItemSideBar } from './item-sidebar';
import { WithMobileHandle } from '../../hoc/mobile-handle';

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

export {
  DraggableContainer,
  DraggableItemSideBarWithMobile as DraggableItemSideBar,
  DraggableItemBottom,
  DraggableItemPopupWithMobile as DraggableItemPopup,
  DraggableItemFloatWithMobile as DraggableItemFloat,
};
