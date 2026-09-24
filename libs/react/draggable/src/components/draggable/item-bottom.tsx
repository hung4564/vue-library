import type { ReactNode } from 'react';

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
  afterTitle?: ReactNode;
}

export function DraggableItemBottom({
  id: stableId,
  show: propShow,
  title = '',
  containerId: propContainerId,
  componentCard,
  componentCardHeader,
  onUpdateShow,
  onClose,
  children,
  afterTitle,
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
      componentCard,
      componentCardHeader,
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
      afterTitle={afterTitle}
    >
      {children}
    </BottomModule>
  );
}
