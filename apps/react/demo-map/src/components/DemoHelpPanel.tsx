import type { DemoHelpSection } from '@hungpvq/demo-map-datasets';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useLocation } from 'react-router';
import {
  getDemoPageGuide,
  type DemoPageGuide,
} from '../demo-guides';
import './DemoHelpPanel.css';

const MOBILE_MQ = '(max-width: 640px)';
const DRAG_THRESHOLD_PX = 4;

type Pos = { left: number; top: number };

function offsetParentRect(el: HTMLElement) {
  const parent = el.offsetParent as HTMLElement | null;
  if (!parent) {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  const r = parent.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function clampPos(left: number, top: number, el: HTMLElement): Pos {
  const parent = offsetParentRect(el);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const maxL = Math.max(0, parent.width - w);
  const maxT = Math.max(0, parent.height - h);
  return {
    left: Math.min(Math.max(0, left), maxL),
    top: Math.min(Math.max(0, top), maxT),
  };
}

export function DemoHelpPanel(props?: {
  guide?: DemoPageGuide;
  intro?: string;
  sections?: DemoHelpSection[];
}) {
  const location = useLocation();
  const resolved = useMemo<DemoPageGuide | undefined>(() => {
    if (props?.guide) return props.guide;
    if (props?.sections?.length) {
      return { intro: props.intro, sections: props.sections };
    }
    return getDemoPageGuide(location.pathname);
  }, [props?.guide, props?.intro, props?.sections, location.pathname]);

  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches,
  );
  const [open, setOpen] = useState(() => !isMobile);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef({
    pointerId: null as number | null,
    moved: false,
    originX: 0,
    originY: 0,
    startLeft: 0,
    startTop: 0,
  });

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      setOpen(!mobile);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const onHeaderPointerDown = useCallback((e: ReactPointerEvent) => {
    if (e.button !== 0 || !panelRef.current) return;
    const el = panelRef.current;
    const parent = offsetParentRect(el);
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      pointerId: e.pointerId,
      moved: false,
      originX: e.clientX,
      originY: e.clientY,
      startLeft: rect.left - parent.left,
      startTop: rect.top - parent.top,
    };

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (ev.pointerId !== d.pointerId || !panelRef.current) return;
      const dx = ev.clientX - d.originX;
      const dy = ev.clientY - d.originY;
      if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      d.moved = true;
      setDragging(true);
      ev.preventDefault();
      setPos(clampPos(d.startLeft + dx, d.startTop + dy, panelRef.current));
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== dragRef.current.pointerId) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      dragRef.current.pointerId = null;
      setDragging(false);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }, []);

  const onHeaderClick = useCallback(() => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    setOpen((v) => !v);
  }, []);

  if (!resolved?.sections?.length) return null;

  const panelStyle: CSSProperties | undefined = pos
    ? { left: pos.left, top: pos.top, right: 'auto', bottom: 'auto' }
    : undefined;

  return (
    <aside
      ref={panelRef}
      className={[
        'demo-help',
        open ? 'demo-help--open' : '',
        isMobile ? 'demo-help--mobile' : '',
        dragging ? 'demo-help--dragging' : '',
        pos ? 'demo-help--moved' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={panelStyle}
    >
      <button
        type="button"
        className="demo-help__toggle"
        aria-expanded={open}
        aria-controls="demo-page-help"
        title="Drag to move · click to show/hide"
        onPointerDown={onHeaderPointerDown}
        onClick={onHeaderClick}
      >
        <span className="demo-help__toggle-label">
          {open ? 'Hide guide' : 'Demo guide'}
        </span>
        <span className="demo-help__toggle-icon" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open ? (
        <div
          id="demo-page-help"
          className="demo-help__body"
          role="region"
          aria-label="Demo guide"
        >
          {resolved.intro ? (
            <p className="demo-help__intro">{resolved.intro}</p>
          ) : null}
          <ul className="demo-help__list">
            {resolved.sections.map((section) => (
              <li key={section.id} className="demo-help__item">
                <div className="demo-help__title">{section.title}</div>
                <div className="demo-help__text">{section.body}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
