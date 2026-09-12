import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Visibility vs dismiss:
 * - `setShow` / `update:show` — hide/show only (toggle, exclusive bottom/sidebar).
 * - `close()` — dismiss request (X / Escape / management Hide); emits `close`.
 */
export function useShow(
  props: { show?: boolean },
  emit?: {
    'update:show'?: (value: boolean) => void;
    close?: () => void;
  },
  init?: boolean,
) {
  // Match Vue: local state is source of truth; prop syncs in when it changes.
  const [p_show, setPShow] = useState<boolean>(!!props.show || !!init);
  const emitRef = useRef(emit);
  emitRef.current = emit;
  const showRef = useRef(p_show);
  showRef.current = p_show;

  useEffect(() => {
    if (props.show !== undefined) {
      setPShow(props.show);
    }
  }, [props.show]);

  const setShow = useCallback((val: boolean) => {
    if (showRef.current === val) return;
    showRef.current = val;
    setPShow(val);
    emitRef.current?.['update:show']?.(val);
  }, []);

  const open = useCallback(() => {
    setShow(true);
  }, [setShow]);

  const close = useCallback(() => {
    const wasOpen = showRef.current;
    showRef.current = false;
    setPShow(false);
    if (wasOpen) {
      emitRef.current?.['update:show']?.(false);
    }
    emitRef.current?.close?.();
  }, []);

  return { show: p_show, setShow, open, close };
}

export const withShowProps = {
  show: Boolean,
};

export const withShowEmit = {
  'update:show': (value: boolean) => Boolean,
  close: () => Boolean,
};

export function useExpand(
  props: { expand?: boolean },
  emit?: {
    'update:expand'?: (value: boolean) => void;
  },
  init?: boolean,
) {
  const [p_expand, setPExpand] = useState<boolean>(!!init);

  useEffect(() => {
    if (props.expand !== undefined) {
      setPExpand(props.expand);
    }
  }, [props.expand]);

  const setExpand = useCallback(
    (val: boolean) => {
      setPExpand(val);
      emit?.['update:expand']?.(val);
    },
    [emit],
  );

  const toggle = useCallback(() => {
    setExpand(!p_expand);
  }, [p_expand, setExpand]);

  return { expand: p_expand, setExpand, toggle };
}

export const withExpandProps = {
  expand: Boolean,
};

export const withExpandEmit = {
  'update:expand': (_value: boolean) => Boolean,
};

export const useHighlight = (ms = 5000) => {
  const [isHighlight, setIsHighlight] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setHighLight = (highlight?: boolean) => {
    const newValue = highlight !== undefined ? highlight : !isHighlight;
    setIsHighlight(newValue);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (newValue) {
      timeoutRef.current = setTimeout(() => {
        setIsHighlight(false);
        timeoutRef.current = null;
      }, ms);
    }
  };

  return { isHighlight, setHighLight };
};
