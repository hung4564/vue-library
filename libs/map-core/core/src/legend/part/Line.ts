import { LineLayerSpecification } from 'maplibre-gl';
import type { LegendElement, PropsLegendOption } from '../../types/legend';

export default function Line(
  props: PropsLegendOption<LineLayerSpecification>,
): LegendElement {
  const { layer, image, expr } = props;
  const linePatternDataUrl = image(
    expr(layer, 'paint', 'line-pattern') as string,
  );

  const style = {
    stroke: linePatternDataUrl
      ? `url(#img1)`
      : expr(layer, 'paint', 'line-color'),
    strokeWidth: Math.max(
      2,
      Math.min(expr(layer, 'paint', 'line-width') as number, 8),
    ),
    strokeOpacity: expr(layer, 'paint', 'line-opacity'),
    strokeDasharray: expr(layer, 'paint', 'line-dasharray'),
  };
  const sw = style.strokeWidth;
  const pathStyle: {
    stroke: string;
    strokeOpacity?: string | number;
    strokeDasharray?: string | number;
  } = {
    stroke: String(style.stroke ?? ''),
  };
  if (style.strokeOpacity != null && style.strokeOpacity !== '') {
    pathStyle.strokeOpacity = style.strokeOpacity as string | number;
  }
  if (style.strokeDasharray != null && style.strokeDasharray !== '') {
    pathStyle.strokeDasharray = Array.isArray(style.strokeDasharray)
      ? style.strokeDasharray.join(' ')
      : (style.strokeDasharray as string | number);
  }

  return {
    element: 'svg',
    attributes: {
      viewBox: '0 0 20 20',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    children: [
      {
        element: 'defs',
        attributes: {
          key: 'defs',
        },
        children: [
          {
            element: 'pattern',
            attributes: {
              key: 'pattern',
              id: 'img1',
              x: 0,
              y: 0,
              width: style.strokeWidth,
              height: style.strokeWidth,
              patternUnits: 'userSpaceOnUse',
              patternTransform: `translate(${-(sw / 2)} ${-(
                sw / 2
              )}) rotate(45)`,
            },
            children: [
              {
                element: 'image',
                attributes: {
                  key: 'img',
                  href: linePatternDataUrl,
                  x: 0,
                  y: 0,
                  width: style.strokeWidth,
                  height: style.strokeWidth,
                },
              },
            ],
          },
        ],
      },
      {
        element: 'path',
        attributes: {
          key: 'path',
          style: pathStyle,
          d: 'M0 20 L 20 0',
        },
      },
    ],
  };
}
