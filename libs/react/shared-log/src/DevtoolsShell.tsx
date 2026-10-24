import type { DebugTabRegistration } from '@hungpvq/shared-log';
import { BaseButton, Tabs } from '@hungpvq/react-ui-core';
import type { ComponentType } from 'react';

import { registerBuiltinDebugTabs } from './register-builtin';
import { useDebugHost } from './use-debug-host';

registerBuiltinDebugTabs();

function tabLabel(tab: DebugTabRegistration): string {
  return typeof tab.label === 'function' ? tab.label() : tab.label;
}

export function DevtoolsShell({
  showClose,
  onClose,
}: {
  showClose?: boolean;
  onClose?: () => void;
}) {
  const { host, activeTab, tabs } = useDebugHost();
  const items = tabs.map((tab) => ({ id: tab.id, label: tabLabel(tab) }));
  return (
    <div className="devtools-popup-body">
      <div className="devtools-header">
        <Tabs
          items={items}
          value={activeTab}
          onChange={(id) => host.setActiveTab(id)}
          withPanes={false}
        />
        {showClose ? (
          <BaseButton
            className="close-btn"
            onClick={onClose}
          >
            X
          </BaseButton>
        ) : null}
      </div>
      <div className="devtools-content">
        {tabs.map((tab) => {
          const Pane = tab.component as ComponentType;
          return (
            <div
              key={tab.id}
              className="devtools-content__pane"
              hidden={activeTab !== tab.id}
            >
              <Pane />
            </div>
          );
        })}
      </div>
    </div>
  );
}
