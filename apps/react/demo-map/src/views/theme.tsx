import { BaseMapControl, Map, ThemeControl } from '@hungpvq/react-map-core';
import { useEffect, useState } from 'react';
import { DemoHelpPanel } from '../components/DemoHelpPanel';
import { DemoLanguageControl } from '../components/DemoLanguageControl';
import { MapPageShell } from '../components/MapPageShell';
import { AsideControl } from '../layout/AsideControl';
import './theme.css';
import { DevtoolsControl } from '@hungpvq/react-map-devtools';

function readTokens() {
  const style = getComputedStyle(document.documentElement);
  return {
    primary: style.getPropertyValue('--map-primary-color').trim(),
    background: style.getPropertyValue('--map-background-color').trim(),
  };
}

function ThemeTokenPanel() {
  const [tokens, setTokens] = useState(readTokens);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTokens(readTokens()));
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
    };
  }, []);

  return (
    <div className="demo-theme-tokens" data-testid="demo-theme-tokens">
      <div className="demo-theme-tokens__title">Theme tokens</div>
      <dl>
        <dt>--map-primary-color</dt>
        <dd>
          <span
            className="demo-theme-tokens__swatch"
            style={{ background: tokens.primary }}
          />
          {tokens.primary || '—'}
        </dd>
        <dt>--map-background-color</dt>
        <dd>
          <span
            className="demo-theme-tokens__swatch"
            style={{ background: tokens.background }}
          />
          {tokens.background || '—'}
        </dd>
      </dl>
    </div>
  );
}

export function ThemePage() {
  return (
    <MapPageShell>
      <Map>
        <DevtoolsControl position="bottom-right" />
        <DemoLanguageControl />
        <AsideControl position="top-left" />
        <BaseMapControl position="bottom-left" />
        <ThemeControl />
        <ThemeTokenPanel />
        <DemoHelpPanel />
      </Map>
    </MapPageShell>
  );
}
