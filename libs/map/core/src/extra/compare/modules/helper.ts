export function MapCompareSwiper(
  handleEl: HTMLElement,
  div1: HTMLElement,
  div2: HTMLElement
) {
  let bounds = div2.getBoundingClientRect();

  const resize = () => {
    bounds = div2.getBoundingClientRect();
  };

  const getX = (e: MouseEvent | TouchEvent): number => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    let x = clientX - bounds.left;
    x = Math.max(0, Math.min(x, bounds.width));
    return x;
  };

  const setPosition = (x: number) => {
    const pos = `translate(${x}px, 0)`;
    handleEl.style.transform = pos;
    handleEl.style.webkitTransform = pos;

    div1.style.clip = `rect(0, ${x}px, ${bounds.height}px, 0)`;
    div2.style.clip = `rect(0, 999em, ${bounds.height}px, ${x}px)`;
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    setPosition(getX(e));
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMove as EventListener);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const onTouchEnd = () => {
    document.removeEventListener('touchmove', onMove as EventListener);
    document.removeEventListener('touchend', onTouchEnd);
  };

  const onDown = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      document.addEventListener('touchmove', onMove as EventListener, {
        passive: false,
      });
      document.addEventListener('touchend', onTouchEnd);
    } else {
      document.addEventListener('mousemove', onMove as EventListener);
      document.addEventListener('mouseup', onMouseUp);
    }
  };

  handleEl.addEventListener('mousedown', onDown as EventListener);
  handleEl.addEventListener('touchstart', onDown as EventListener, {
    passive: false,
  });

  const clear = () => {
    handleEl.removeEventListener('mousedown', onDown as EventListener);
    handleEl.removeEventListener('touchstart', onDown as EventListener);
    div1.style.clip = '';
    div2.style.clip = '';
  };

  // Set initial position at center
  const initialX = bounds.width / 2;
  setPosition(initialX);

  return {
    clear,
    resize,
  };
}
export function MapCompareSwiperVertical(
  handleEl: HTMLElement,
  div1: HTMLElement,
  div2: HTMLElement
) {
  let bounds = div2.getBoundingClientRect();

  const resize = () => {
    bounds = div2.getBoundingClientRect();
    setPosition(bounds.height / 2);
  };

  const getY = (e: MouseEvent | TouchEvent): number => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const y = clientY - bounds.top;
    return Math.max(0, Math.min(y, bounds.height));
  };

  const setPosition = (y: number) => {
    handleEl.style.transform = `translateY(${y}px)`;

    // Reveal upper part of div1 (from top to y)
    div1.style.clipPath = `inset(0px 0px ${bounds.height - y}px 0px)`;
    div2.style.clipPath = `inset(${y}px 0px 0px 0px)`;
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    setPosition(getY(e));
  };

  const onEnd = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  };

  const onStart = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    } else {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
    }
  };

  handleEl.addEventListener('mousedown', onStart);
  handleEl.addEventListener('touchstart', onStart, { passive: false });

  const clear = () => {
    handleEl.removeEventListener('mousedown', onStart);
    handleEl.removeEventListener('touchstart', onStart);
    onEnd();
    div1.style.clipPath = '';
    div2.style.clipPath = '';
  };

  // Initial middle position
  setPosition(bounds.height / 2);

  return {
    clear,
    resize,
  };
}
