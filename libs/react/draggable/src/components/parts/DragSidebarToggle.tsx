import { useIcon } from '../../hook';

export interface DragSidebarToggleProps {
  location?: string;
  expand?: boolean;
  onClick?: () => void;
  'aria-controls'?: string;
  'aria-label'?: string;
  'aria-expanded'?: boolean | 'true' | 'false';
  role?: string;
}

export function DragSidebarToggle({
  expand = false,
  onClick,
  ...props
}: DragSidebarToggleProps) {
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
