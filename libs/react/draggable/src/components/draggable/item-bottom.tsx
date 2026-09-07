import { ReactNode } from 'react';
import { useContainerId } from '../../context/ContainerContext';
import {
  ShareCardComponent,
  ShareHeaderComponent,
  useInitAction,
  useShow,
} from '../../hook';
import { useInitBottom } from '../../hook/useInitBottom';
import { BottomModule } from './bottom/bottom-module';

export interface DraggableItemBottomProps {
  id?: string;
  show?: boolean;
  expand?: boolean;
  title?: string;
  containerId?: string;
  componentCard?: ShareCardComponent;
  componentCardHeader?: ShareHeaderComponent;
  disabledExpand?: boolean;
  disabledHeader?: boolean;
  disabledClose?: boolean;
  disabledOrder?: boolean;
  highlightMs?: number;
  onUpdateShow?: (value: boolean) => void;
  onClose?: () => void;
  onUpdateExpand?: (value: boolean) => void;
  children?: ReactNode;
  extraBtn?: ReactNode;
}

export function DraggableItemBottom({
  id: stableId,
  show: propShow,
  title = '',
  containerId: propContainerId,
  onUpdateShow,
  onClose,
  children,
}: DraggableItemBottomProps) {
  const containerId = useContainerId(propContainerId);
  const { show, setShow, open, close } = useShow(
    { show: propShow },
    {
      'update:show': onUpdateShow,
      close: onClose,
    },
  );
  const { itemId } = useInitBottom(
    containerId,
    show,
    setShow,
    {
      title,
      type: 'item-bottom',
    },
    stableId,
  );
  useInitAction(containerId, itemId, {
    open,
    close,
  });

  return (
    <BottomModule
      containerId={containerId}
      itemId={itemId}
      title={title || undefined}
    >
      {children}
    </BottomModule>
  );
}
