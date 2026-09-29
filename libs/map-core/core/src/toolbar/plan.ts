import type { Position } from '../types';
import { MAP_BUTTON_SIZE_PX } from '../ui/map-button';
import {
  cornerVerticalMenuBudgetsPx,
  groupToolbarButtons,
  maxVisibleButtonsInStackHeight,
  maxVisibleToolbarButtons,
  splitToolbarOverflow,
  splitToolbarOverflowKeepGroups,
  type ToolbarButtonGroup,
  type ToolbarOverflowPrefer,
} from './overflow';
import type { MapControlButtonState } from './types';

const DEFAULT_CORNER_POSITIONS: Position[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

export type PlanToolbarLayoutInput = {
  buttons: MapControlButtonState[];
  menuMode: boolean;
  hostHeight: number;
  availableWidth: number;
  maxVisible?: number;
  buttonSize?: number;
  reservedByCorner?: Partial<
    Record<Position, { width: number; height: number }>
  >;
  menuUsedByCorner?: Partial<Record<Position, number>>;
  cornerPositions?: Position[];
};

export type PlanToolbarCorner = {
  position: Position;
  prefer: ToolbarOverflowPrefer;
  maxVisible: number;
  split: { visible: ToolbarButtonGroup[]; overflow: ToolbarButtonGroup[] };
  showMore: boolean;
  hasChrome: boolean;
};

export type PlanToolbarLayoutResult = {
  groups: ToolbarButtonGroup[];
  maxVisibleToolbar: number;
  toolbarSplit: {
    visible: ToolbarButtonGroup[];
    overflow: ToolbarButtonGroup[];
  };
  corners: PlanToolbarCorner[];
};

/**
 * Pure layout planner for ToolbarControl hosts (row overflow + corner stacks).
 */
export function planToolbarLayout(
  input: PlanToolbarLayoutInput,
): PlanToolbarLayoutResult {
  const buttonSize = input.buttonSize ?? MAP_BUTTON_SIZE_PX.medium;
  const groups = groupToolbarButtons(input.buttons);
  const maxVisibleToolbar =
    input.maxVisible ??
    maxVisibleToolbarButtons(input.availableWidth, buttonSize);
  const toolbarSplit = splitToolbarOverflow(groups, maxVisibleToolbar);

  if (!input.menuMode) {
    return {
      groups,
      maxVisibleToolbar,
      toolbarSplit,
      corners: [],
    };
  }

  const reserved = input.reservedByCorner ?? {};
  const menuUsed = input.menuUsedByCorner ?? {};
  const cornerPositions = input.cornerPositions ?? DEFAULT_CORNER_POSITIONS;

  const corners = cornerPositions
    .map((position): PlanToolbarCorner | null => {
      const cornerGroups = groupToolbarButtons(
        input.buttons.filter(
          (b) => (b.position || 'bottom-right') === position,
        ),
      );
      if (!cornerGroups.length) return null;
      const side = position.endsWith('left') ? 'left' : 'right';
      const budgets = cornerVerticalMenuBudgetsPx({
        hostHeight: input.hostHeight,
        topReservedPx: reserved[`top-${side}` as Position]?.height ?? 0,
        bottomReservedPx: reserved[`bottom-${side}` as Position]?.height ?? 0,
        topMenuUsedPx: menuUsed[`top-${side}` as Position],
        bottomMenuUsedPx: menuUsed[`bottom-${side}` as Position],
      });
      const budgetPx = position.startsWith('top')
        ? budgets.topPx
        : budgets.bottomPx;
      const prefer: ToolbarOverflowPrefer = position.startsWith('bottom')
        ? 'end'
        : 'start';
      const maxVisible =
        input.maxVisible ??
        maxVisibleButtonsInStackHeight(budgetPx, buttonSize);
      const split = splitToolbarOverflowKeepGroups(
        cornerGroups,
        maxVisible,
        prefer,
      );
      return {
        position,
        prefer,
        maxVisible,
        split,
        showMore: split.overflow.length > 0 && maxVisible >= 1,
        hasChrome:
          cornerGroups.length > 0 &&
          (split.visible.length > 0 || maxVisible >= 1),
      };
    })
    .filter((c): c is PlanToolbarCorner => c != null && c.hasChrome);

  return {
    groups,
    maxVisibleToolbar,
    toolbarSplit,
    corners,
  };
}

export type PlanToolbarExpansionResult = {
  primaryGroups: ToolbarButtonGroup[];
  secondaryButtons: MapControlButtonState[];
};

/**
 * Split expandable modules: primary keeps launchers; options go to secondary
 * when `expandedModuleId` matches the group id.
 */
export function planToolbarExpansion(
  groups: ToolbarButtonGroup[],
  expandedModuleId: string | null,
): PlanToolbarExpansionResult {
  const secondaryButtons: MapControlButtonState[] = [];
  const primaryGroups: ToolbarButtonGroup[] = [];

  for (const group of groups) {
    const expandable = group.buttons.some((b) => b.expandable);
    if (!expandable) {
      primaryGroups.push(group);
      continue;
    }

    const launchers = group.buttons.filter(
      (b) => b.role === 'launcher' || (b.expandable && !b.role),
    );
    const options = group.buttons.filter((b) => b.role === 'option');

    if (expandedModuleId === group.id) {
      secondaryButtons.push(...options);
    }

    primaryGroups.push({
      ...group,
      buttons: launchers.length > 0 ? launchers : group.buttons,
    });
  }

  return {
    primaryGroups: primaryGroups.filter((g) => g.buttons.length > 0),
    secondaryButtons,
  };
}

/**
 * Shared click path: launcher toggles expand; everything else runs `action`.
 */
export function handleToolbarButtonClick(
  btn: MapControlButtonState,
  e: MouseEvent,
  api: { toggleExpandedModule: (id: string) => void },
): void {
  if (btn.expandable && (btn.role === 'launcher' || !btn.role)) {
    const moduleId = btn.group || btn.id.replace(/:launcher$/, '');
    e.stopPropagation?.();
    api.toggleExpandedModule(moduleId);
    return;
  }
  btn.action(e);
}

/**
 * Whether pointerdown outside the toolbar should collapse the open module.
 * Reads `closeOnOutsideClick` stamped on the launcher (default true).
 */
export function shouldCloseExpandedOnOutsideClick(
  buttons: MapControlButtonState[],
  expandedModuleId: string | null,
): boolean {
  if (!expandedModuleId) return false;
  const launcher = buttons.find(
    (b) =>
      b.group === expandedModuleId &&
      (b.role === 'launcher' || (b.expandable && !b.role)),
  );
  return launcher?.closeOnOutsideClick !== false;
}
