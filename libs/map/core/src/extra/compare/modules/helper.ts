export function MapCompareSwiper(el: any, div_1: any, div_2: any) {
  let _bounds = div_2.getBoundingClientRect();
  const resize = () => {
    _bounds = div_2.getBoundingClientRect();
  };
  const _onDown = (e: any) => {
    if (e.touches) {
      document.addEventListener('touchmove', _onMove);
      document.addEventListener('touchend', _onTouchEnd);
    } else {
      document.addEventListener('mousemove', _onMove);
      document.addEventListener('mouseup', _onMouseUp);
    }
  };

  const _onMove = (e: any) => {
    _setPosition(_getX(e));
  };
  const _getX = (e: any) => {
    e = e.touches ? e.touches[0] : e;
    let x = e.clientX - _bounds.left;
    if (x < 0) x = 0;
    if (x > _bounds.width) x = _bounds.width;
    return x;
  };
  const _onMouseUp = () => {
    document.removeEventListener('mousemove', _onMove);
    document.removeEventListener('mouseup', _onMouseUp);
  };

  const _onTouchEnd = () => {
    document.removeEventListener('touchmove', _onMove);
    document.removeEventListener('touchend', _onTouchEnd);
  };

  const _setPosition = (x: any) => {
    x = Math.min(x, _bounds.width);
    const pos = 'translate(' + x + 'px, 0)';
    el.style.transform = pos;
    el.style.WebkitTransform = pos;
    const clipA = 'rect(0, ' + x + 'px, ' + _bounds.height + 'px, 0)';
    const clipB = 'rect(0, 999em, ' + _bounds.height + 'px,' + x + 'px)';

    div_1.style.clip = clipA;
    div_2.style.clip = clipB;
  };
  el.addEventListener('mousedown', _onDown);
  el.addEventListener('touchstart', _onDown);
  const clear = () => {
    el.removeEventListener('mousedown', _onDown);
    el.removeEventListener('touchstart', _onDown);
  };
  const swiperPosition = _bounds.width / 2;
  _setPosition(swiperPosition);
  return {
    clear,
    resize,
  };
}
