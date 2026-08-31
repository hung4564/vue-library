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

/** @mdi/react treats number as rem (×1.5); normalize to px to match Vue `:size="16"`. */
function resolveSize(size?: number | string): string {
  if (size == null || size === '') return '16px';
  if (typeof size === 'number') return `${size}px`;
  if (/^\d+(\.\d+)?$/.test(size)) return `${size}px`;
  return size;
}

function MdiIcon({ path, size }: { path: string; size?: number | string }) {
  return (
    <Icon
      path={path}
      size={resolveSize(size)}
      className="hungpvq-draggable-icon"
    />
  );
}

export function useIcon() {
  return {
    ShowIcon: (props: IconProps) => (
      <MdiIcon path={mdiEyeOutline} size={props.size} />
    ),
    HideIcon: (props: IconProps) => (
      <MdiIcon path={mdiEyeOffOutline} size={props.size} />
    ),
    CloseIcon: (props: IconProps) => (
      <MdiIcon path={mdiClose} size={props.size} />
    ),
    HighlightIcon: (props: IconProps) => (
      <MdiIcon path={mdiMarker} size={props.size} />
    ),
    FullscreenIcon: (props: IconProps) => (
      <MdiIcon path={mdiArrowDownDropCircleOutline} size={props.size} />
    ),
    OffFullscreenIcon: (props: IconProps) => (
      <MdiIcon path={mdiArrowUpDropCircleOutline} size={props.size} />
    ),
    ToBackIcon: (props: IconProps) => (
      <MdiIcon path={mdiArrangeSendBackward} size={props.size} />
    ),
    ToFrontIcon: (props: IconProps) => (
      <MdiIcon path={mdiArrangeBringForward} size={props.size} />
    ),
    ExpandedIcon: (props: IconProps) => (
      <MdiIcon path={mdiArrowUpDropCircleOutline} size={props.size} />
    ),
    CloseExpandedIcon: (props: IconProps) => (
      <MdiIcon path={mdiArrowDownDropCircleOutline} size={props.size} />
    ),
    DragIcon: (props: IconProps) => (
      <MdiIcon path={mdiDragVariant} size={props.size} />
    ),
    SidebarExpandedIcon: (props: IconProps) => (
      <MdiIcon path={mdiMenuLeft} size={props.size} />
    ),
    SidebarCloseExpandedIcon: (props: IconProps) => (
      <MdiIcon path={mdiMenuRight} size={props.size} />
    ),
    SidebarOpenMenu: (props: IconProps) => (
      <MdiIcon path={mdiMenu} size={props.size} />
    ),
  };
}
