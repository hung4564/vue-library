import React from 'react';
import { MapHeader } from '@hungpvq/react-draggable';

export function CustomCardHeader({
  title,
  preTitle,
  extraBtn,
}: {
  title?: React.ReactNode;
  preTitle?: React.ReactNode;
  extraBtn?: React.ReactNode;
}) {
  return (
    <MapHeader
      title={
        <span style={{ color: '#667eea', fontWeight: 'bold' }}>{title}</span>
      }
      preTitle={preTitle}
      extraBtn={extraBtn}
    />
  );
}
