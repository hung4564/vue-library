import { useIcon } from '../../hook';

export interface MapSidebarToggleProps {
  location?: string;
  expand?: boolean;
  onClick?: () => void;
  'aria-controls'?: string;
  'aria-label'?: string;
  role?: string;
}

export function MapSidebarToggle({
  expand = false,
  onClick,
  ...props
}: MapSidebarToggleProps) {
  const { SidebarExpandedIcon, SidebarCloseExpandedIcon } = useIcon();

  return (
    <button type="button" onClick={onClick} {...props}>
      {expand ? (
        <SidebarExpandedIcon size={'16px'} />
      ) : (
        <SidebarCloseExpandedIcon size={'16px'} />
      )}
    </button>
  );
}
