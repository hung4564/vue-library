import type { Position } from '../types';
import type {
  MapControlAction,
  MapControlHandle,
  MapControlPanelKind,
  MapControlPanelPosition,
} from './control';

/**
 * Framework-agnostic inputs for {@link buildMapControlHandle}.
 * Adapters supply open-state + panel position callbacks (Vue/React differ).
 */
export type BuildMapControlHandleInput = {
  id: string;
  panelKind: MapControlPanelKind;
  title?: string;
  buttonPosition?: Position;
  defaultActionType?: string;
  getProps?: () => Record<string, unknown>;
  actions?: readonly MapControlAction[];
  isOpen: () => boolean;
  setShow: (show: boolean) => void;
  getPanelPosition: () => MapControlPanelPosition;
  setPanelPosition: (pos: MapControlPanelPosition) => void;
};

/**
 * Shared MapControlHandle construction (props snapshot, open/close, runAction).
 */
export function buildMapControlHandle(
  input: BuildMapControlHandleInput,
): MapControlHandle {
  const {
    id,
    panelKind,
    title,
    buttonPosition,
    defaultActionType,
    getProps,
    isOpen,
    setShow,
    getPanelPosition,
    setPanelPosition,
  } = input;

  function actionList(): MapControlAction[] {
    return [...(input.actions ?? [])];
  }

  function actionMap(): Map<string, MapControlAction['run']> {
    return new Map(actionList().map((a) => [a.type, a.run]));
  }

  return {
    id,
    panelKind,
    title,
    buttonPosition,
    defaultActionType,
    props: {
      panelKind,
      buttonPosition,
      title,
      defaultActionType,
      ...(getProps?.() ?? {}),
    },
    actions: actionList().map(({ type, title: t }) => ({ type, title: t })),
    isOpen,
    open() {
      setShow(true);
    },
    close() {
      setShow(false);
    },
    toggle() {
      setShow(!isOpen());
    },
    setShow,
    getPanelPosition,
    setPanelPosition,
    runAction(type?: string, event?: unknown) {
      const list = actionList();
      const map = actionMap();
      if (!type) {
        if (list.length === 1) {
          list[0].run(event);
          return;
        }
        if (list.length === 0) {
          setShow(!isOpen());
          return;
        }
        const preferred = defaultActionType || id;
        const fallback = map.get(preferred);
        if (fallback) {
          fallback(event);
          return;
        }
        throw new Error(
          `[UniversalRegistry] Control '${id}' has multiple actions; pass type or set defaultActionType`,
        );
      }
      const run = map.get(type);
      if (!run) {
        throw new Error(
          `[UniversalRegistry] Control '${id}' has no action '${type}'`,
        );
      }
      run(event);
    },
  };
}
