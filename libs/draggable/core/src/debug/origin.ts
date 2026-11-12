export type DragItemOriginKind = 'component' | 'hook' | 'function';

export type DragItemOrigin = {
  kind: DragItemOriginKind;
  /** Component name, hook name, or inferred function name. */
  name: string;
  hook?: string;
  caller?: string;
  /** Source file + line when it can be read from the stack. */
  file?: string;
};

const SKIP =
  /captureDragOrigin|registerDragItemOrigin|recordDragItemOrigin|resolveVueDragComponentName|useInitItem|useInitSidebar|useInitDrawer|useInitBottom|useInitAction|DraggableItem|DraggableContainer|WithMobileHandle|getCurrentInstance|commitHookEffect|invokePassiveEffect|callComponent|renderWithHooks|callWithErrorHandling|callWithAsyncErrorHandling|Object\.apply|Module\.|__vite|node_modules|vue-draggable|react-draggable/;

/** Wrappers that must never be reported as the creating component. */
const INTERNAL_NAME = /WithMobileHandle|DraggableItem|DraggableContainer/;

const PASCAL = /^[A-Z][A-Za-z0-9]+$/;

export function isInternalDragOriginName(name?: string): boolean {
  return !name || INTERNAL_NAME.test(name) || SKIP.test(name);
}

function parseFrame(line: string): { name?: string; file?: string } {
  const named = line.match(/at\s+(?:async\s+)?([^\s(]+)/);
  const loc = line.match(/\(([^)]+)\)/)?.[1] ?? '';
  const file = /[\\/]|\.(vue|tsx?|jsx?)/i.test(loc)
    ? loc
        .replace(/\\/g, '/')
        .replace(/^.*\/(?=[^/]+$)/, '')
        .split('?')[0]
    : undefined;
  return { name: named?.[1], file };
}

function parseStack(stack?: string): { caller?: string; file?: string } {
  if (!stack) return {};
  for (const line of stack.split('\n').slice(1)) {
    const { name, file } = parseFrame(line);
    if (
      !name ||
      isInternalDragOriginName(name) ||
      name.startsWith('http') ||
      name.includes('/')
    ) {
      continue;
    }
    return { caller: name, file };
  }
  return {};
}

export function captureDragOrigin(input: {
  hook: string;
  component?: string;
  stack?: string;
}): DragItemOrigin {
  const parsed = parseStack(input.stack ?? new Error().stack);
  const caller = parsed.caller;
  const file = parsed.file;
  const component = isInternalDragOriginName(input.component)
    ? undefined
    : input.component;
  if (component) {
    return {
      kind: 'component',
      name: component,
      hook: input.hook,
      caller,
      file,
    };
  }
  if (caller && PASCAL.test(caller) && !isInternalDragOriginName(caller)) {
    return { kind: 'component', name: caller, hook: input.hook, caller, file };
  }
  if (caller) {
    return { kind: 'function', name: caller, hook: input.hook, caller, file };
  }
  return { kind: 'hook', name: input.hook, hook: input.hook, file };
}

export function dragOriginKey(containerId: string, id: string): string {
  return `${containerId}::${id}`;
}

export function formatDragOrigin(origin?: DragItemOrigin): string {
  if (!origin) return '—';
  return `${origin.kind}: ${origin.name}`;
}

/** Human label: created from a Vue/React component vs a function vs the hook. */
export function describeDragOrigin(origin?: DragItemOrigin): string {
  if (!origin) return 'origin unknown';
  if (origin.kind === 'component')
    return `created from component ${origin.name}`;
  if (origin.kind === 'function') return `created from function ${origin.name}`;
  return `created from hook ${origin.name}`;
}
