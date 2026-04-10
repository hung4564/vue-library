import {
  mdiArrangeBringForward,
  mdiArrangeSendBackward,
  mdiArrowDownDropCircleOutline,
  mdiArrowUpDropCircleOutline,
  mdiClose,
  mdiDragVariant,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiMarker,
  mdiMenu,
  mdiMenuLeft,
  mdiMenuRight,
} from '@mdi/js';
import { Icon } from '@mdi/react';

type IconProps = { size?: number | string };
export function useIcon() {
  return {
    ShowIcon: (props: IconProps) => (
      <Icon path={mdiEyeOutline} size={props.size || 16} />
    ),
    HideIcon: (props: IconProps) => (
      <Icon path={mdiEyeOffOutline} size={props.size || 16} />
    ),
    CloseIcon: (props: IconProps) => (
      <Icon path={mdiClose} size={props.size || 16} />
    ),
    HighlightIcon: (props: IconProps) => (
      <Icon path={mdiMarker} size={props.size || 16} />
    ),
    FullscreenIcon: (props: IconProps) => (
      <Icon path={mdiArrowDownDropCircleOutline} size={props.size || 16} />
    ),
    OffFullscreenIcon: (props: IconProps) => (
      <Icon path={mdiArrowUpDropCircleOutline} size={props.size || 16} />
    ),
    ToBackIcon: (props: IconProps) => (
      <Icon path={mdiArrangeSendBackward} size={props.size || 16} />
    ),
    ToFrontIcon: (props: IconProps) => (
      <Icon path={mdiArrangeBringForward} size={props.size || 16} />
    ),
    ExpandedIcon: (props: IconProps) => (
      <Icon path={mdiArrowUpDropCircleOutline} size={props.size || 16} />
    ),
    CloseExpandedIcon: (props: IconProps) => (
      <Icon path={mdiArrowDownDropCircleOutline} size={props.size || 16} />
    ),
    DragIcon: (props: IconProps) => (
      <Icon path={mdiDragVariant} size={props.size || 16} />
    ),
    SidebarExpandedIcon: (props: IconProps) => (
      <Icon path={mdiMenuLeft} size={props.size || 16} />
    ),
    SidebarCloseExpandedIcon: (props: IconProps) => (
      <Icon path={mdiMenuRight} size={props.size || 16} />
    ),
    SidebarOpenMenu: (props: IconProps) => (
      <Icon path={mdiMenu} size={props.size || 16} />
    ),
  };
}
