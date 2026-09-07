import { ReactNode, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBottomContainer } from '../../../hook/useBottomContainer';
import { useStoreReactive } from '../../../store';

export interface BottomModuleProps {
  containerId: string;
  itemId: string;
  title?: ReactNode;
  children?: ReactNode;
}

export function BottomModule({
  containerId,
  itemId,
  title,
  children,
}: BottomModuleProps) {
  useStoreReactive();
  const { getShow } = useBottomContainer(containerId);
  const titleTo = useMemo(() => `bottom-title-${containerId}`, [containerId]);
  const contentTo = useMemo(
    () => `bottom-content-${containerId}`,
    [containerId],
  );
  const isCurrentShow = useMemo(() => {
    return !!(containerId && itemId && itemId === getShow());
  }, [containerId, itemId, getShow]);

  const [portalTargets, setPortalTargets] = useState<{
    title?: HTMLElement;
    content?: HTMLElement;
  }>({});

  useLayoutEffect(() => {
    if (!isCurrentShow) {
      setPortalTargets({});
      return;
    }

    const resolveTargets = () => {
      const nextTitle = document.getElementById(titleTo) ?? undefined;
      const nextContent = document.getElementById(contentTo) ?? undefined;
      setPortalTargets({
        title: nextTitle,
        content: nextContent,
      });
      return !!(nextTitle && nextContent);
    };

    if (resolveTargets()) return;

    // Shell may appear after this commit on first open — observe until hosts exist.
    const observer = new MutationObserver(() => {
      if (resolveTargets()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const frameId = requestAnimationFrame(() => {
      if (resolveTargets()) observer.disconnect();
    });
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [isCurrentShow, titleTo, contentTo]);

  if (!isCurrentShow) return null;

  return (
    <div className="module-bottom__container">
      {title &&
        portalTargets.title &&
        createPortal(title, portalTargets.title)}
      {children &&
        portalTargets.content &&
        createPortal(children, portalTargets.content)}
    </div>
  );
}
