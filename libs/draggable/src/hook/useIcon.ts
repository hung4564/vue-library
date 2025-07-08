import ArrangeBringForwardIcon from 'vue-material-design-icons/ArrangeBringForward.vue';
import ArrangeSendBackwardIcon from 'vue-material-design-icons/ArrangeSendBackward.vue';
import ArrowDownDropCircleOutlineIcon from 'vue-material-design-icons/ArrowDownDropCircleOutline.vue';
import ArrowUpDropCircleOutlineIcon from 'vue-material-design-icons/ArrowUpDropCircleOutline.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import DragVariantIcon from 'vue-material-design-icons/DragVariant.vue';
import HideIcon from 'vue-material-design-icons/EyeOffOutline.vue';
import ShowIcon from 'vue-material-design-icons/EyeOutline.vue';
import MarkerIcon from 'vue-material-design-icons/Marker.vue';
import MenuIcon from 'vue-material-design-icons/Menu.vue';
import MenuLeftIcon from 'vue-material-design-icons/MenuLeft.vue';
import MenuRightIcon from 'vue-material-design-icons/MenuRight.vue';
export function useIcon() {
  return {
    ShowIcon,
    HideIcon,
    CloseIcon,
    HighlightIcon: MarkerIcon,
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
