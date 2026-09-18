import {
  clearMenuTypeahead,
  focusFirst,
  getMenuItems,
  handleMenuKeydown,
  restoreFocus,
  trapTabKey,
} from '@hungpvq/draggable';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';

export type ContextMenuRef = {
  open: (e: ReactMouseEvent | MouseEvent) => void;
  close: () => void;
};

export type ContextMenuProps = {
  zIndex?: string | number;
  /** Accessible name for the menu region. */
  ariaLabel?: string;
  children?: ReactNode;
  onOpenChange?: (open: boolean) => void;
};

const ContextMenu = forwardRef(function ContextMenu(
  {
    zIndex = 10000,
    ariaLabel = 'Context menu',
    children,
    onOpenChange,
  }: ContextMenuProps,
  ref: Ref<ContextMenuRef>,
) {
  const targetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stylePosition, setStylePosition] = useState<CSSProperties>({});
  const [isMobile, setIsMobile] = useState(false);
  const lastOpenEventRef = useRef<MouseEvent | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const close = useCallback(() => {
    setIsOpen((open) => (open ? false : open));
    setStylePosition({});
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open(e: ReactMouseEvent | MouseEvent) {
        const ev =
          'nativeEvent' in e ? (e as ReactMouseEvent).nativeEvent : (e as MouseEvent);
        lastOpenEventRef.current = ev;
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        setIsOpen(true);
      },
      close,
    }),
    [close],
  );

  // Notify parent outside setState updaters — calling setState on SidebarContainer
  // from inside ContextMenu's updater triggers "Cannot update a component while rendering".
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current === isOpen) return;
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;
    onOpenChangeRef.current?.(isOpen);
    if (wasOpen && !isOpen) {
      clearMenuTypeahead();
      restoreFocus(previousFocusRef.current);
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !targetRef.current) return;
    const menu = targetRef.current;
    const ev = lastOpenEventRef.current;
    lastOpenEventRef.current = null;

    if (isMobile) {
      setStylePosition({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#00000085',
      });
      return;
    }

    const w = menu.offsetWidth || 150;
    const h = menu.offsetHeight || 100;
    const x = ev?.clientX ?? 0;
    const y = ev?.clientY ?? 0;
    const left = x + w >= window.innerWidth ? x - w + 10 : x;
    const top = y + h >= window.innerHeight ? y - h + 10 : y;
    setStylePosition({ left: `${left}px`, top: `${top}px` });
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen) return;
    const root = contentRef.current;
    if (root) {
      const items = getMenuItems(root);
      if (items[0]) items[0].focus();
      else focusFirst(root);
    }
    const onPointer = (e: MouseEvent) => {
      const el = targetRef.current;
      if (!el || el.contains(e.target as Node)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      const root = contentRef.current;
      if (!root) return;
      if (e.key === 'Tab') {
        const items = getMenuItems(root);
        if (items.length > 0) {
          e.preventDefault();
          const active = document.activeElement as HTMLElement | null;
          const idx = active ? items.indexOf(active) : -1;
          if (e.shiftKey) {
            const prev = idx <= 0 ? items.length - 1 : idx - 1;
            items[prev].focus();
          } else {
            const next = idx >= items.length - 1 ? 0 : idx + 1;
            items[next].focus();
          }
          return;
        }
        trapTabKey(root, e);
        return;
      }
      handleMenuKeydown(root, e);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent) => {
      if (isMobile && e.target === e.currentTarget) close();
    },
    [isMobile, close],
  );

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={targetRef}
      className={`context-menu-container ${isMobile ? 'context-menu-mobile' : ''}`}
      style={{
        position: 'fixed',
        zIndex: String(zIndex),
        ...stylePosition,
      }}
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        className="context-menu-content"
        role="menu"
        tabIndex={-1}
        aria-orientation="vertical"
        aria-label={ariaLabel}
      >
        {children}
      </div>
      {isMobile && (
        <button
          type="button"
          className="context-menu-btn-close"
          onClick={close}
          aria-label="Close menu"
        >
          Close
        </button>
      )}
    </div>,
    document.body,
  );
});

export { ContextMenu };
