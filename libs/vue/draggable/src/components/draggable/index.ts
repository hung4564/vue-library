import { WithMobileHandle } from '../../hoc/mobile-handle';
import DraggableContainer from './draggable-container.vue';
import DraggableItemBottom from './item-bottom.vue';
import DraggableDrawerOrigin from './item-drawer.vue';
import DraggableItemFloatOrigin from './item-float.vue';
import DraggableModalOrigin from './item-modal.vue';
import DraggableItemPopupOrigin from './item-popup.vue';
import DraggableItemSideBarOrigin from './item-sidebar.vue';
const DraggableItemSideBar = WithMobileHandle(
  DraggableItemSideBarOrigin,
  DraggableItemBottom,
);
const DraggableItemPopup = WithMobileHandle(
  DraggableItemPopupOrigin,
  DraggableItemBottom,
);
const DraggableItemFloat = WithMobileHandle(
  DraggableItemFloatOrigin,
  DraggableItemBottom,
);
const DraggableModal = WithMobileHandle(
  DraggableModalOrigin,
  DraggableItemBottom,
);
const DraggableDrawer = WithMobileHandle(
  DraggableDrawerOrigin,
  DraggableItemBottom,
);
export {
  DraggableContainer,
  DraggableDrawer,
  DraggableItemBottom,
  DraggableItemFloat,
  DraggableItemPopup,
  DraggableItemSideBar,
  DraggableModal,
};
