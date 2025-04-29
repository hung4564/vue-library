import { FillLayerSpecification } from 'maplibre-gl';
import { PropsLegendOption } from '../types';

export default function Fill(props: PropsLegendOption<FillLayerSpecification>) {
  const { image, expr, layer } = props;
  const imageKey = expr(layer, 'paint', 'fill-pattern') as string;
  const dataUrl = image(imageKey);

  const style = {
    width: '100%',
    height: '100%',
    backgroundImage: imageKey ? `url(${dataUrl})` : undefined,
    backgroundColor: imageKey ? undefined : expr(layer, 'paint', 'fill-color'),
    opacity: expr(layer, 'paint', 'fill-opacity'),
    backgroundSize: '66% 66%',
    backgroundPosition: 'center',
  };
  return {
    element: 'div',
    attributes: {
      style,
    },
  };
}
