import type { DemoHelpSection } from '@hungpvq/demo-map-datasets';
import { getDemoHelpChrome, type DemoPageGuide } from '@hungpvq/demo-map-datasets';
import { getStoredMapLanguage } from '@hungpvq/map-core';
import { useLang, useMapContext } from '@hungpvq/react-map-core';
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
import { getDemoPageGuide } from '../demo-guides';
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
  const { mapId } = useMapContext();
  const { language } = useLang(mapId);
  const guideLang = language || getStoredMapLanguage('vi');
  const chrome = useMemo(() => getDemoHelpChrome(guideLang), [guideLang]);

  const resolved = useMemo<DemoPageGuide | undefined>(() => {
    if (props?.guide) return props.guide;
    if (props?.sections?.length) {
      return { intro: props.intro, sections: props.sections };
    }
    return getDemoPageGuide(location.pathname, guideLang);
  }, [props?.guide, props?.intro, props?.sections, location.pathname, guideLang]);

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
      const next = mq.matches;
      setIsMobile((was) => {
        if (!was && next) setOpen(false);
        if (was && !next) setOpen(true);
        return next;
      });
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const detachDragListeners = useCallback(() => {
    window.removeEventListener('pointermove', onPointerMoveRef.current);
    window.removeEventListener('pointerup', onPointerUpRef.current);
    window.removeEventListener('pointercancel', onPointerUpRef.current);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (e.pointerId !== d.pointerId || !panelRef.current) return;
    const dx = e.clientX - d.originX;
    const dy = e.clientY - d.originY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    d.moved = true;
    setDragging(true);
    e.preventDefault();
    setPos(clampPos(d.startLeft + dx, d.startTop + dy, panelRef.current));
  }, []);

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      if (e.pointerId !== dragRef.current.pointerId) return;
      detachDragListeners();
      dragRef.current.pointerId = null;
      setDragging(false);
    },
    [detachDragListeners],
  );

  const onPointerMoveRef = useRef(onPointerMove);
  const onPointerUpRef = useRef(onPointerUp);
  onPointerMoveRef.current = onPointerMove;
  onPointerUpRef.current = onPointerUp;

  const onHeaderPointerDown = (e: ReactPointerEvent) => {
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
    window.addEventListener('pointermove', onPointerMoveRef.current);
    window.addEventListener('pointerup', onPointerUpRef.current);
    window.addEventListener('pointercancel', onPointerUpRef.current);
  };

  const onHeaderClick = (e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
      return;
    }
    setOpen((v) => !v);
  };

  useEffect(() => () => detachDragListeners(), [detachDragListeners]);

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
        title={chrome.dragHint}
        onPointerDown={onHeaderPointerDown}
        onClick={onHeaderClick}
      >
        <span className="demo-help__toggle-label">
          {open ? chrome.hide : chrome.show}
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
          aria-label={chrome.title}
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
