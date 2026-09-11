import type { ButtonInMobile } from '@hungpvq/map-core';
import {
  BaseMapControl,
  FullScreenControl,
  GeoLocateControl,
  GotoControl,
  HomeControl,
  InfoControl,
  Map,
  MeasurementControl,
  MouseCoordinatesControl,
  ThemeControl,
  ToolbarControl,
  ZoomControl,
} from '@hungpvq/react-map-core';
import { useState } from 'react';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';

const MODES: ButtonInMobile[] = ['button', 'toolbar', 'menu'];

export function MobileMenuPage() {
  const [buttonInMobile, setButtonInMobile] =
    useState<ButtonInMobile>('menu');

  return (
    <MapPageShell>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            background: '#fafafa',
            zIndex: 5,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, marginRight: 4 }}>
            buttonInMobile
          </span>
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setButtonInMobile(mode)}
              style={{
                border:
                  buttonInMobile === mode
                    ? '1px solid #1976d2'
                    : '1px solid rgba(0,0,0,0.16)',
                background: buttonInMobile === mode ? '#e3f2fd' : '#fff',
                color: buttonInMobile === mode ? '#0d47a1' : 'inherit',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {mode}
            </button>
          ))}
          <span
            style={{ fontSize: 12, color: '#666', marginLeft: 'auto' }}
          >
            Resize ≤640px (or DevTools mobile) to see promotion / corner menu
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Map buttonInMobile={buttonInMobile}>
            <AsideControl position="top-left" />
            <ToolbarControl />
            <MeasurementControl position="top-right" />
            <GotoControl position="top-right" />
            <InfoControl position="top-right" />
            <ThemeControl />
            <GeoLocateControl />
            <FullScreenControl />
            <ZoomControl />
            <HomeControl />
            <MouseCoordinatesControl />
            <BaseMapControl position="bottom-left" />
          </Map>
        </div>
      </div>
    </MapPageShell>
  );
}
