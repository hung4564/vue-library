/** Focusable menu items under a `role="menu"` root. */
export function getMenuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
    (el) =>
      el.getAttribute('aria-disabled') !== 'true' && !el.hasAttribute('disabled'),
  );
}

const TYPEAHEAD_RESET_MS = 500;
let typeaheadBuffer = '';
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

/** Reset typeahead buffer (tests / menu close). */
export function clearMenuTypeahead() {
  typeaheadBuffer = '';
  if (typeaheadTimer !== undefined) {
    clearTimeout(typeaheadTimer);
    typeaheadTimer = undefined;
  }
}

function scheduleTypeaheadReset() {
  if (typeaheadTimer !== undefined) clearTimeout(typeaheadTimer);
  typeaheadTimer = setTimeout(() => {
    typeaheadBuffer = '';
    typeaheadTimer = undefined;
  }, TYPEAHEAD_RESET_MS);
}

function itemLabel(el: HTMLElement): string {
  return (el.textContent || '').trim().toLowerCase();
}

/**
 * Printable-character typeahead: focus the next item whose label starts with
 * the accumulated buffer (WAI-ARIA menu pattern).
 */
function handleTypeahead(root: HTMLElement, event: KeyboardEvent): boolean {
  if (event.key.length !== 1) return false;
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  // Ignore space — used to activate the focused item.
  if (event.key === ' ') return false;

  const items = getMenuItems(root);
  if (items.length === 0) return false;

  const ch = event.key.toLowerCase();
  typeaheadBuffer += ch;
  scheduleTypeaheadReset();

  const active = document.activeElement as HTMLElement | null;
  let start = items.findIndex((el) => el === active || el.contains(active));
  if (start < 0) start = -1;

  const buffer = typeaheadBuffer;
  for (let offset = 1; offset <= items.length; offset++) {
    const idx = (start + offset) % items.length;
    if (itemLabel(items[idx]).startsWith(buffer)) {
      event.preventDefault();
      items[idx].focus();
      return true;
    }
  }

  // Single-char wrap: if buffer grew past one char and nothing matched, retry with last char.
  if (buffer.length > 1) {
    typeaheadBuffer = ch;
    for (let offset = 1; offset <= items.length; offset++) {
      const idx = (start + offset) % items.length;
      if (itemLabel(items[idx]).startsWith(ch)) {
        event.preventDefault();
        items[idx].focus();
        return true;
      }
    }
  }

  return false;
}

/**
 * Arrow / Home / End / Enter / Space / typeahead navigation inside a menu.
 * Returns true if handled. Call from the menu root keydown listener.
 */
export function handleMenuKeydown(
  root: HTMLElement,
  event: KeyboardEvent,
): boolean {
  const items = getMenuItems(root);
  if (items.length === 0) return false;

  const active = document.activeElement as HTMLElement | null;
  let index = items.findIndex((el) => el === active || el.contains(active));
  if (index < 0) index = 0;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight': {
      event.preventDefault();
      clearMenuTypeahead();
      items[(index + 1) % items.length].focus();
      return true;
    }
    case 'ArrowUp':
    case 'ArrowLeft': {
      event.preventDefault();
      clearMenuTypeahead();
      items[(index - 1 + items.length) % items.length].focus();
      return true;
    }
    case 'Home': {
      event.preventDefault();
      clearMenuTypeahead();
      items[0].focus();
      return true;
    }
    case 'End': {
      event.preventDefault();
      clearMenuTypeahead();
      items[items.length - 1].focus();
      return true;
    }
    case 'Enter':
    case ' ': {
      if (active && items.includes(active)) {
        event.preventDefault();
        clearMenuTypeahead();
        active.click();
        return true;
      }
      return false;
    }
    default:
      return handleTypeahead(root, event);
  }
}
