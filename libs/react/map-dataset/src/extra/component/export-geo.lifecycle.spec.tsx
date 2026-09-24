import type { IDataset } from '@hungpvq/map-dataset';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { FeatureCollection } from 'geojson';
import { type ReactNode, StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ExportGeo } from './export-geo';

vi.mock('@hungpvq/react-draggable', () => ({
  DraggableModal: ({
    children,
    show,
  }: {
    children?: ReactNode;
    show?: boolean;
  }) => (show ? <div data-testid="export-modal">{children}</div> : null),
}));

vi.mock('@hungpvq/react-map-core', async () => {
  const React = await import('react');
  return {
    useMap: () => ({ moduleContainerProps: { dragId: 'drag-test' } }),
    useShow: (init = false) => {
      const [show, setShow] = React.useState(!!init);
      const toggleShow = (value?: boolean | string) => {
        if (value != null) {
          setShow(!!value);
          return;
        }
        setShow((v: boolean) => !v);
      };
      return [show, toggleShow] as const;
    },
    ModuleContainer: ({
      draggable,
    }: {
      draggable?: (ctx: { containerId: string }) => ReactNode;
    }) => draggable?.({ containerId: 'container-test' }) ?? null,
    RegistryItem: ({
      defaultComponent: Comp,
      ...rest
    }: {
      defaultComponent?: React.ComponentType<Record<string, unknown>>;
      [key: string]: unknown;
    }) => (Comp ? <Comp {...rest} /> : null),
    MapControlButton: ({
      children,
      onClick,
      disabled,
    }: {
      children?: ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <button type="button" disabled={disabled} onClick={onClick}>
        {children}
      </button>
    ),
  };
});

vi.mock('@hungpvq/react-map-core/fields', () => ({
  InputText: ({
    label,
    value,
    onChange,
    disabled,
  }: {
    label?: string;
    value?: string;
    onChange?: (v: string) => void;
    disabled?: boolean;
  }) => (
    <label>
      {label}
      <input
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  ),
  InputSelect: () => null,
  InputCrs: () => null,
}));

vi.mock('@hungpvq/map-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hungpvq/map-core')>();
  return {
    ...actual,
    errorHandler: { handle: vi.fn() },
  };
});

const fc: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '1',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  ],
};

const emptyFc: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

const fakeLayer = {
  id: 'layer-export-test',
  getName: () => 'Test Layer',
  getParent: () => undefined,
} as unknown as IDataset;

describe('ExportGeo StrictMode lifecycle', () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let anchorClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:mock');
    revokeObjectURL = vi.fn();
    anchorClick = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      anchorClick,
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('downloads under StrictMode (controller not left disposed)', async () => {
    render(
      <StrictMode>
        <ExportGeo layer={fakeLayer} getCollection={async () => fc} />
      </StrictMode>,
    );

    expect(screen.getByTestId('export-modal')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalled();
      expect(anchorClick).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.queryByTestId('export-modal')).toBeNull();
    });
  });

  it('shows No features to export and keeps modal open', async () => {
    render(
      <StrictMode>
        <ExportGeo layer={fakeLayer} getCollection={async () => emptyFc} />
      </StrictMode>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Download' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(
        /No features to export/,
      );
    });
    expect(screen.getByTestId('export-modal')).toBeTruthy();
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
