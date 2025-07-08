import ArrangeBringForwardIcon from 'vue-material-design-icons/ArrangeBringForward.vue';
import ArrangeSendBackwardIcon from 'vue-material-design-icons/ArrangeSendBackward.vue';
import ArrowDownDropCircleOutlineIcon from 'vue-material-design-icons/ArrowDownDropCircleOutline.vue';
import ArrowUpDropCircleOutlineIcon from 'vue-material-design-icons/ArrowUpDropCircleOutline.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import DragVariantIcon from 'vue-material-design-icons/DragVariant.vue';
import MenuIcon from 'vue-material-design-icons/Menu.vue';
import MenuLeftIcon from 'vue-material-design-icons/MenuLeft.vue';
import MenuRightIcon from 'vue-material-design-icons/MenuRight.vue';
export function useIcon() {
  return {
    CloseIcon,
    FullscreenIcon: ArrowDownDropCircleOutlineIcon,
    OffFullscreenIcon: ArrowUpDropCircleOutlineIcon,
    ToBackIcon: ArrangeSendBackwardIcon,
    ToFrontIcon: ArrangeBringForwardIcon,
    ExpandedIcon: ArrowUpDropCircleOutlineIcon,
    CloseExpandedIcon: ArrowDownDropCircleOutlineIcon,
    DragIcon: DragVariantIcon,
    SidebarExpandedIcon: MenuLeftIcon,
    SidebarCloseExpandedIcon: MenuRightIcon,
    SidebarOpenMenu: MenuIcon,
  };
}
