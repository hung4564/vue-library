import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { List } from './List';
import { ListItem } from './ListItem';

describe('List.tsx', () => {
  it('renders default ul element and list role', () => {
    const { container } = render(
      <List>
        <li>Item 1</li>
      </List>
    );

    const el = container.querySelector('ul');
    expect(el).toBeTruthy();
    expect(el?.className).toContain('ui-list');
    expect(el?.textContent).toBe('Item 1');
  });

  it('supports modifier classes: dense, divided, flush', () => {
    const { container } = render(
      <List
        as="div"
        dense
        divided
        flush
      />
    );

    const el = container.querySelector('div');
    expect(el).toBeTruthy();
    expect(el?.className).toContain('ui-list--dense');
    expect(el?.className).toContain('ui-list--divided');
    expect(el?.className).toContain('ui-list--flush');
  });
});

describe('ListItem.tsx', () => {
  it('renders li with content and prefix/suffix', () => {
    const { container } = render(
      <ListItem
        prefix={<span className="test-prefix">P</span>}
        suffix={<span className="test-suffix">S</span>}
      >
        Main Content
      </ListItem>
    );

    const el = container.querySelector('li');
    expect(el).toBeTruthy();
    expect(el?.className).toContain('ui-list-item');
    expect(el?.className).toContain('ui-list-item--interactive');
    expect(container.querySelector('.ui-list-item__prefix')?.textContent).toBe('P');
    expect(container.querySelector('.ui-list-item__content')?.textContent).toBe('Main Content');
    expect(container.querySelector('.ui-list-item__suffix')?.textContent).toBe('S');
  });

  it('supports selected state', () => {
    const { container } = render(
      <ListItem selected>Selected Item</ListItem>
    );

    const el = container.querySelector('li');
    expect(el?.className).toContain('ui-list-item--selected');
    expect(el?.getAttribute('aria-selected')).toBe('true');
  });

  it('emits click on interactive item', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <ListItem onClick={handleClick}>Clickable</ListItem>
    );

    const el = container.querySelector('li') as HTMLElement;
    fireEvent.click(el);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not emit click when disabled', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <ListItem
        disabled
        onClick={handleClick}
      >
        Disabled
      </ListItem>
    );

    const el = container.querySelector('li') as HTMLElement;
    expect(el.className).toContain('ui-list-item--disabled');
    expect(el.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(el);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
