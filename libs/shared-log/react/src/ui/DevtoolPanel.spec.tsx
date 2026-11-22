import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DevtoolPanelCard } from './DevtoolPanelCard';
import { DevtoolPanelContainer } from './DevtoolPanelContainer';
import { DevtoolPanelSplit } from './DevtoolPanelSplit';
import { DevtoolPanelToolbar } from './DevtoolPanelToolbar';

describe('DevtoolPanel components', () => {
  describe('DevtoolPanelContainer', () => {
    it('renders root .devtool-panel and .devtool-panel__body with children', () => {
      const { container } = render(
        <DevtoolPanelContainer className="custom-class" data-testid="panel">
          <span data-testid="child">Body Content</span>
        </DevtoolPanelContainer>,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root).not.toBeNull();
      expect(root.className).toContain('devtool-panel');
      expect(root.className).toContain('custom-class');
      expect(root.getAttribute('data-testid')).toBe('panel');

      const body = root.querySelector('.devtool-panel__body');
      expect(body).not.toBeNull();
      expect(body?.textContent).toBe('Body Content');
    });

    it('renders title prop above body', () => {
      const { container } = render(
        <DevtoolPanelContainer
          title={<div data-testid="custom-title">Toolbar</div>}
        >
          <div>Body</div>
        </DevtoolPanelContainer>,
      );

      const root = container.firstElementChild as HTMLElement;
      const titleEl = root.querySelector('[data-testid="custom-title"]');
      const bodyEl = root.querySelector('.devtool-panel__body');

      expect(titleEl).not.toBeNull();
      expect(bodyEl).not.toBeNull();
      expect(root.children[0]).toBe(titleEl);
      expect(root.children[1]).toBe(bodyEl);
    });
  });

  describe('DevtoolPanelToolbar', () => {
    it('renders .devtool-panel__toolbar with title and actions in dedicated slots', () => {
      const { container } = render(
        <DevtoolPanelToolbar
          className="extra-toolbar"
          title="Toolbar Title"
          actions={<button type="button">Action</button>}
        />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root).not.toBeNull();
      expect(root.className).toContain('devtool-panel__toolbar');
      expect(root.className).toContain('extra-toolbar');

      const titleEl = root.querySelector('.devtool-panel__title');
      expect(titleEl?.textContent).toBe('Toolbar Title');

      const actionsEl = root.querySelector('.devtool-panel__actions');
      expect(actionsEl?.querySelector('button')?.textContent).toBe('Action');
    });

    it('renders children when passed', () => {
      const { container } = render(
        <DevtoolPanelToolbar>
          <span data-testid="extra-child">Extra</span>
        </DevtoolPanelToolbar>,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.querySelector('[data-testid="extra-child"]')?.textContent).toBe(
        'Extra',
      );
    });
  });

  describe('DevtoolPanelCard', () => {
    it('renders .devtool-panel__card with children and modifiers', () => {
      const { container } = render(
        <DevtoolPanelCard flush className="custom-card">
          Card Body
        </DevtoolPanelCard>,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root).not.toBeNull();
      expect(root.className).toContain('devtool-panel__card');
      expect(root.className).toContain('devtool-panel__card--flush');
      expect(root.className).toContain('custom-card');
      expect(root.textContent).toBe('Card Body');
    });
  });

  describe('DevtoolPanelSplit', () => {
    it('renders .devtool-panel__split container', () => {
      const { container } = render(
        <DevtoolPanelSplit className="custom-split">
          <div>Pane 1</div>
          <div>Pane 2</div>
        </DevtoolPanelSplit>,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root).not.toBeNull();
      expect(root.className).toContain('devtool-panel__split');
      expect(root.className).toContain('custom-split');
      expect(root.children).toHaveLength(2);
    });
  });
});
