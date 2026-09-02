import { useState, useCallback, useRef, useEffect } from 'react';

export function useShow(
  props: { show?: boolean },
  emit?: {
    'update:show'?: (value: boolean) => void;
    close?: () => void;
  },
  init?: boolean,
) {
  const isControlled = props.show !== undefined;
  const [uncontrolledShow, setUncontrolledShow] = useState<boolean>(
    !!props.show || !!init,
  );
  const emitRef = useRef(emit);
  emitRef.current = emit;

  const show = isControlled ? props.show! : uncontrolledShow;

  const setShow = useCallback(
    (val: boolean) => {
      if (!isControlled) {
        setUncontrolledShow(val);
      }
      emitRef.current?.['update:show']?.(val);
      if (!val) {
        emitRef.current?.close?.();
      }
    },
    [isControlled],
  );

  const open = useCallback(() => {
    setShow(true);
  }, [setShow]);

  const close = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return { show, setShow, open, close };
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

export const useHighlight = () => {
  const [isHighlight, setIsHighlight] = useState(false);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const setHighLight = (highlight?: boolean) => {
    const newValue = highlight !== undefined ? highlight : !isHighlight;
    setIsHighlight(newValue);
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (newValue) {
      timeout = setTimeout(() => {
        setIsHighlight(false);
        timeout = null;
      }, 5000);
    }
  };

  return { isHighlight, setHighLight };
};
