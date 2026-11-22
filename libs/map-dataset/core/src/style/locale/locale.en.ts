import circleStyleLang from '../lang/style/circle-style.json';
import fillStyleLang from '../lang/style/fill-style.json';
import lineStyleLang from '../lang/style/line-style.json';
import rasterStyleLang from '../lang/style/raster-style.json';
import symbolStyleLang from '../lang/style/symbol-style.json';
import styleControlLang from '../lang/style-control.json';

export {
  circleStyleLang,
  fillStyleLang,
  lineStyleLang,
  rasterStyleLang,
  styleControlLang,
  symbolStyleLang,
};

export const STYLE_CONTROL_LOCALE = {
  map: { 'style-control': styleControlLang },
  'circle-style': circleStyleLang,
  'line-style': lineStyleLang,
  'fill-style': fillStyleLang,
  'symbol-style': symbolStyleLang,
  'raster-style': rasterStyleLang,
};
