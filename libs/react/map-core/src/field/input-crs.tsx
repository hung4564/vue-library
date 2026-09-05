import type { CrsItem } from '@hungpvq/map-core';
import {
  buildCrsSearchCatalog,
  buildMapCrsCatalog,
  formatCrsLabel,
  getCrsInputSuggestions,
  lookupCrsItem,
  normalizeEpsgCode,
} from '@hungpvq/map-core';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMapCrsItems } from '../extra/crs/useMapCrsItems';
import { useMap } from '../hooks';

export interface InputCrsProps {
  label?: string;
  placeholder?: string;
  value?: string;
  /** Override map CRS store; when omitted, uses CRS configured on the map. */
  items?: CrsItem[];
  onChange?: (value: string) => void;
}

function listPositionStyle(anchor: DOMRect): React.CSSProperties {
  const gap = 2;
  const spaceBelow = window.innerHeight - anchor.bottom - gap;
  const openUp = spaceBelow < 96 && anchor.top > spaceBelow;
  return {
    position: 'fixed',
    left: anchor.left,
    width: anchor.width,
    zIndex: 100000,
    maxHeight: 180,
    ...(openUp
      ? { top: 'auto', bottom: window.innerHeight - anchor.top + gap }
      : { top: anchor.bottom + gap, bottom: 'auto' }),
  };
}

export function InputCrs({
  label,
  placeholder = 'EPSG:4326',
  value = '',
  items,
  onChange,
}: InputCrsProps) {
  const { mapId } = useMap();
  const { items: storeItems } = useMapCrsItems(mapId);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listStyle, setListStyle] = useState<React.CSSProperties>({});
  const focusedRef = useRef(false);
  const queryRef = useRef(query);
  queryRef.current = query;
  const blurTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const sourceItems = items ?? buildMapCrsCatalog(storeItems);

  const catalog = useMemo(() => buildCrsSearchCatalog(sourceItems), [sourceItems]);

  const selectedItem = useMemo(
    () => lookupCrsItem(value, catalog),
    [catalog, value],
  );

  const dropdownItems = useMemo(
    () => getCrsInputSuggestions(catalog, query, value),
    [catalog, query, value],
  );

  const showList = open && dropdownItems.length > 0;

  function syncQueryFromModel() {
    setQuery(selectedItem ? formatCrsLabel(selectedItem) : value || '');
    setActiveIndex(-1);
  }

  useEffect(() => {
    if (focusedRef.current) return;
    setQuery(selectedItem ? formatCrsLabel(selectedItem) : value || '');
    setActiveIndex(-1);
  }, [selectedItem, value]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [dropdownItems]);

  useLayoutEffect(() => {
    if (!showList) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    function update() {
      const el = wrapRef.current;
      if (!el) return;
      setListStyle(listPositionStyle(el.getBoundingClientRect()));
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [showList]);

  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current
      ?.querySelector('.input-crs__option._active')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  function commitFromQuery(nextQuery = query) {
    const q = nextQuery.trim();
    if (
      selectedItem &&
      (q === formatCrsLabel(selectedItem) ||
        q === selectedItem.epsg ||
        q.toLowerCase() === `epsg:${selectedItem.epsg}`)
    ) {
      setQuery(formatCrsLabel(selectedItem));
      return;
    }

    const normalized = normalizeEpsgCode(q);
    if (normalized) {
      const item = lookupCrsItem(normalized, catalog);
      if (item) {
        selectItem(item);
        return;
      }
      onChange?.(normalized);
      setQuery(`EPSG:${normalized}`);
      return;
    }

    setQuery(selectedItem ? formatCrsLabel(selectedItem) : value || '');
  }

  function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
    clearTimeout(blurTimerRef.current);
    focusedRef.current = true;
    setOpen(true);
    event.currentTarget.select();
  }

  function handleBlur() {
    blurTimerRef.current = setTimeout(() => {
      focusedRef.current = false;
      setOpen(false);
      setActiveIndex(-1);
      commitFromQuery(queryRef.current);
    }, 120);
  }

  function handleInput(nextValue: string) {
    queryRef.current = nextValue;
    setQuery(nextValue);
    setOpen(true);
    setActiveIndex(-1);
  }

  function selectItem(item: CrsItem) {
    queryRef.current = formatCrsLabel(item);
    onChange?.(item.epsg);
    setQuery(formatCrsLabel(item));
    setOpen(false);
    setActiveIndex(-1);
  }

  function moveDropdownSelection(delta: number) {
    if (!dropdownItems.length) return;

    setActiveIndex((current) => {
      if (current < 0) {
        return delta > 0 ? 0 : dropdownItems.length - 1;
      }
      return (current + delta + dropdownItems.length) % dropdownItems.length;
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setOpen(true);
        moveDropdownSelection(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setOpen(true);
        moveDropdownSelection(-1);
        break;
      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0 && dropdownItems[activeIndex]) {
          selectItem(dropdownItems[activeIndex]);
        } else if (dropdownItems.length === 1) {
          selectItem(dropdownItems[0]);
        } else {
          commitFromQuery();
          setOpen(false);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        syncQueryFromModel();
        break;
      default:
        break;
    }
  }

  return (
    <div className="form-group input-crs">
      {label ? <label>{label}</label> : null}
      <div ref={wrapRef} className="input-container input-crs__wrap">
        <input
          type="text"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          placeholder={placeholder}
          value={query}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(event) => handleInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {showList
        ? createPortal(
            <ul
              ref={listRef}
              className="input-crs__list input-crs__list--portal"
              style={listStyle}
              role="listbox"
            >
              {dropdownItems.map((item, index) => (
                <li
                  key={item.epsg}
                  className={`input-crs__option${index === activeIndex ? ' _active' : ''}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectItem(item);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {formatCrsLabel(item)}
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
