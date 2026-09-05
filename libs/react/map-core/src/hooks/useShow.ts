import { useState, useCallback } from 'react';

export interface WithShowProps {
  show?: boolean;
}

export function useShow(
  init = false,
  cbWhenToggle?: (value: boolean) => void,
): [boolean, (value?: boolean | string) => void] {
  const [show, setShow] = useState(init);

  const toggleShow = useCallback(
    (value?: boolean | string) => {
      if (value != null) {
        const newValue = !!value;
        setShow(newValue);
        cbWhenToggle?.(newValue);
        return;
      }
      const newValue = !show;
      setShow(newValue);
      cbWhenToggle?.(newValue);
    },
    [show, cbWhenToggle],
  );

  return [show, toggleShow];
}
