import { getUUIDv4 } from '@hungpvq/shared';
import type {
  AnyToolbarOptions,
  MapControlButtonUIState,
  ToolbarButtonConfig,
  ToolbarButtonGetState,
  ToolbarOptionsModule,
  ToolbarOptionsModuleExpandable,
  ToolbarOptionsSingle,
} from './types';

/** Flat button ready for register/sync (kind already resolved). */
export type FlatToolbarButton = {
  id: string;
  getState: (props: ToolbarButtonGetState) => MapControlButtonUIState;
  onClick?: (e: MouseEvent) => void;
};

export type NormalizeToolbarContext = {
  /** Whether `moduleId` is the open expandable module. */
  isExpanded?: (moduleId: string) => boolean;
};

function moduleStamp(
  moduleId: string,
  order: number | undefined,
  orientation: 'row' | 'column' | undefined,
) {
  return {
    group: moduleId,
    order: order ?? 0,
    orientation: orientation ?? ('column' as const),
  };
}

function mapModuleButtons(
  opts: Pick<
    ToolbarOptionsModule,
    'moduleId' | 'order' | 'orientation' | 'buttons'
  >,
  propsGetState: ToolbarButtonGetState,
  extra?: Partial<MapControlButtonUIState>,
): FlatToolbarButton[] {
  const stamp = moduleStamp(opts.moduleId, opts.order, opts.orientation);
  return opts.buttons.map((btn) => ({
    id: `${opts.moduleId}:${btn.id}`,
    getState: () => ({
      ...btn.getState(propsGetState),
      ...stamp,
      ...extra,
    }),
    onClick: btn.onClick,
  }));
}

/**
 * Kind switch lives here only. Runtime register / ToolbarControl use flat buttons.
 */
export function normalizeToolbarSpec(
  opts: AnyToolbarOptions,
  ctx: NormalizeToolbarContext = {},
): FlatToolbarButton[] {
  const kind = opts.kind ?? 'single';

  if (kind === 'module') {
    return mapModuleButtons(opts as ToolbarOptionsModule, {
      location: 'toolbar',
    });
  }

  if (kind === 'module-expandable') {
    const mod = opts as ToolbarOptionsModuleExpandable;
    const stamp = moduleStamp(mod.moduleId, mod.order, mod.orientation);
    const active = ctx.isExpanded?.(mod.moduleId) ?? false;
    const launcher: FlatToolbarButton = {
      id: `${mod.moduleId}:launcher`,
      getState: () => ({
        ...mod.expandableButton({ active }),
        ...stamp,
        expandable: true,
        role: 'launcher',
        closeOnOutsideClick: mod.closeOnOutsideClick !== false,
      }),
    };
    const options = mapModuleButtons(
      mod,
      { location: 'toolbar' },
      {
        expandable: true,
        role: 'option',
      },
    );
    return [launcher, ...options];
  }

  const single = opts as ToolbarOptionsSingle;
  return [
    {
      id: single.id ?? getUUIDv4(),
      getState: single.getState,
      onClick: single.onClick,
    },
  ];
}

/** Short key for strategy subscribe state (`moduleId:foo` → `foo`). */
export function flatToolbarShortKey(id: string): string {
  const i = id.indexOf(':');
  return i >= 0 ? id.slice(i + 1) : id;
}

/**
 * Map UI state on every button / expandable launcher without long kind switches
 * at call sites (layout wrap, etc.).
 */
export function mapToolbarOptions(
  opts: AnyToolbarOptions,
  mapState: (state: MapControlButtonUIState) => MapControlButtonUIState,
): AnyToolbarOptions {
  if (opts.kind === 'module' || opts.kind === 'module-expandable') {
    const buttons = opts.buttons.map(
      (btn: ToolbarButtonConfig): ToolbarButtonConfig => ({
        ...btn,
        getState: () => mapState(btn.getState({ location: 'toolbar' })),
      }),
    );
    if (opts.kind === 'module-expandable') {
      return {
        ...opts,
        buttons,
        expandableButton: (props: { active: boolean }) =>
          mapState(opts.expandableButton(props)),
      };
    }
    return { ...opts, buttons };
  }
  return {
    ...opts,
    getState: () => mapState(opts.getState({ location: 'toolbar' })),
  };
}

/** Layout fields applied onto toolbar button UI (from control layout store). */
export type ToolbarButtonLayoutFields = {
  visible: boolean;
  order: number;
  position: MapControlButtonUIState['position'];
};

/** Merge control layout SoT onto author button UI state. */
function applyLayoutToButtonState(
  author: MapControlButtonUIState,
  lay: ToolbarButtonLayoutFields,
): MapControlButtonUIState {
  return {
    ...author,
    visible: lay.visible && author.visible !== false,
    get order() {
      return lay.order;
    },
    position: lay.position,
  };
}

/** Wrap toolbar options so sync/mount always read current layout. */
export function withLayoutToolbarOptions(
  opts: AnyToolbarOptions,
  getLayout: () => ToolbarButtonLayoutFields,
): AnyToolbarOptions {
  const mapped = mapToolbarOptions(opts, (state) =>
    applyLayoutToButtonState(state, getLayout()),
  );
  if (mapped.kind === 'module' || mapped.kind === 'module-expandable') {
    return {
      ...mapped,
      get order() {
        return getLayout().order;
      },
    };
  }
  return mapped;
}
