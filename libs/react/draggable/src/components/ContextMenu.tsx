import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
export interface ContextMenuRef {
  open: (e: React.MouseEvent | MouseEvent) => void;
  close: () => void;
}

export interface ContextMenuProps {
  zIndex?: string | number;
  children?: React.ReactNode;
}

export const ContextMenu = forwardRef<ContextMenuRef, ContextMenuProps>(
  function ContextMenu({ zIndex = '9', children }, ref) {
    const targetRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [stylePosition, setStylePosition] = useState<React.CSSProperties>({});
    const [isMobile, setIsMobile] = useState(false);
    const lastOpenEventRef = useRef<MouseEvent | null>(null);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      const mq = window.matchMedia('(max-width: 640px)');
      setIsMobile(mq.matches);
      const fn = () => setIsMobile(mq.matches);
      mq.addEventListener('change', fn);
      return () => mq.removeEventListener('change', fn);
    }, []);

    const close = useCallback(() => {
      setIsOpen(false);
      setStylePosition({});
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        open(e: React.MouseEvent | MouseEvent) {
          const ev =
            'nativeEvent' in e
              ? (e as React.MouseEvent).nativeEvent
              : (e as MouseEvent);
          lastOpenEventRef.current = ev;
          setIsOpen(true);
        },
        close,
      }),
      [close],
    );

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
      const pageX = ev?.clientX ?? 0;
      const pageY = ev?.clientY ?? 0;
      const left = pageX + w >= window.innerWidth ? pageX - w + 10 : pageX - 10;
      const top = pageY + h >= window.innerHeight ? pageY - h + 10 : pageY - 10;
      setStylePosition({ left: `${left}px`, top: `${top}px` });
    }, [isOpen, isMobile]);

    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        const el = targetRef.current;
        if (!el || el.contains(e.target as Node)) return;
        close();
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, close]);

    const handleBackdropClick = useCallback(
      (e: React.MouseEvent) => {
        if (isMobile && e.target === e.currentTarget) close();
      },
      [isMobile, close],
    );

    if (!isOpen) return null;

    return (
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
        <div className="context-menu-content">{children}</div>
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
      </div>
    );
  },
);
