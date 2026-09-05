/* Dynamic registry item: props vary by registered component. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from 'react';
import { useMap } from '../../../hooks';
import { useUniversalRegistry } from '../plugin';

export interface RegistryItemProps {
  componentKey?: string;
  mapId?: string;
  defaultComponent?: ComponentType<any>;
  [key: string]: any;
}

export function RegistryItem({
  componentKey,
  mapId: propsMapId,
  defaultComponent,
  ...rest
}: RegistryItemProps) {
  const { mapId } = useMap({ mapId: propsMapId });
  const { getComponent } = useUniversalRegistry(mapId);
  const Comp = componentKey
    ? getComponent(componentKey) ?? defaultComponent
    : defaultComponent;
  if (!Comp) return null;
  return <Comp mapId={mapId} {...rest} />;
}
