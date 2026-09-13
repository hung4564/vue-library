import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useBottomContainer } from '../../../hook/useBottomContainer';
import { useDragContainer } from '../../../store';
import { useContainerReactive } from '../../../store/useStoreReactive';

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
  useContainerReactive(containerId);
  const { getShow } = useBottomContainer(containerId);
  const { getItemAction } = useDragContainer(containerId);
  const titleTo = useMemo(() => `bottom-title-${containerId}`, [containerId]);
  const contentTo = useMemo(
    () => `bottom-content-${containerId}`,
    [containerId],
  );
  const activeId = getShow();
  const isCurrentShow = !!(containerId && itemId && itemId === activeId);
  const activeAction = activeId ? getItemAction(activeId) : undefined;
  const shellCardKey = `${String(activeAction?.componentCard)}:${String(
    activeAction?.componentCardHeader,
  )}`;

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
  }, [isCurrentShow, titleTo, contentTo, shellCardKey]);

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
