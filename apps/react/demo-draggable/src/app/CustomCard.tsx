import React from 'react';
import { MapCard } from '@hungpvq/react-draggable';

export function CustomCard({
  children,
  highlight,
  ...props
}: {
  children?: React.ReactNode;
  highlight?: boolean;
  [key: string]: any;
}) {
  return (
    <MapCard highlight={highlight} {...props}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '10px' }}>
        {children}
      </div>
    </MapCard>
  );
}
