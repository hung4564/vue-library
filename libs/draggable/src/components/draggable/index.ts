import DraggableContainer from './draggable-container.vue';
import DraggableItemSideBarOrigin from './item-sidebar.vue';
import DraggableItemPopupOrigin from './item-popup.vue';
import DraggableItemFloatOrigin from './item-float.vue';
import DraggableItemBottom from './item-bottom.vue';
import { WithMobileHandle } from '../../hoc/mobile-handle';
const DraggableItemSideBar = WithMobileHandle(
  DraggableItemSideBarOrigin,
  DraggableItemBottom
);
const DraggableItemPopup = WithMobileHandle(
  DraggableItemPopupOrigin,
  DraggableItemBottom
);
const DraggableItemFloat = WithMobileHandle(
  DraggableItemFloatOrigin,
  DraggableItemBottom
);
export {
  DraggableContainer,
  DraggableItemSideBar,
  DraggableItemBottom,
  DraggableItemPopup,
  DraggableItemFloat,
};
