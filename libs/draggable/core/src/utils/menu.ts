/** Focusable menu items under a `role="menu"` root. */
export function getMenuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
    (el) =>
      el.getAttribute('aria-disabled') !== 'true' && !el.hasAttribute('disabled'),
  );
}

/**
 * Arrow / Home / End / Enter / Space navigation inside a menu.
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
    case 'ArrowDown': {
      event.preventDefault();
      items[(index + 1) % items.length].focus();
      return true;
    }
    case 'ArrowUp': {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length].focus();
      return true;
    }
    case 'Home': {
      event.preventDefault();
      items[0].focus();
      return true;
    }
    case 'End': {
      event.preventDefault();
      items[items.length - 1].focus();
      return true;
    }
    case 'Enter':
    case ' ': {
      if (active && items.includes(active)) {
        event.preventDefault();
        active.click();
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}
