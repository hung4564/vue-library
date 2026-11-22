import {
  ensureHungpvqDebugHost,
  isDebugTabEnabled,
  listAllDebugTabs,
  setDebugTabEnabled,
  type DebugTabRegistration,
} from '@hungpvq/shared-log';
import { BaseButton, InputCheckbox, List, ListItem } from '@hungpvq/react-ui-core';
import { useCallback, useEffect, useState } from 'react';

import { DevtoolPanelCard } from '../ui/DevtoolPanelCard';
import { DevtoolPanelContainer } from '../ui/DevtoolPanelContainer';
import { DevtoolPanelToolbar } from '../ui/DevtoolPanelToolbar';

function resolveTabLabel(tab: DebugTabRegistration): string {
  return typeof tab.label === 'function' ? tab.label() : tab.label;
}

export function PanelTabManager() {
  const [tabs, setTabs] = useState<DebugTabRegistration[]>(() =>
    listAllDebugTabs('react'),
  );

  const sync = useCallback(() => {
    setTabs(listAllDebugTabs('react'));
  }, []);

  useEffect(() => {
    sync();
    return ensureHungpvqDebugHost().subscribe(sync);
  }, [sync]);

  const onToggle = (id: string) => {
    setDebugTabEnabled(id, !isDebugTabEnabled(id));
    sync();
  };

  const onEnableAll = () => {
    for (const tab of tabs) {
      setDebugTabEnabled(tab.id, true);
    }
    sync();
  };

  const onDisableAll = () => {
    for (const tab of tabs) {
      if (tab.id !== 'tabs') {
        setDebugTabEnabled(tab.id, false);
      }
    }
    sync();
  };

  return (
    <DevtoolPanelContainer
      title={
        <DevtoolPanelToolbar
          actions={
            <>
              <BaseButton onClick={onEnableAll} title="Enable all tabs">
                Enable All
              </BaseButton>
              <BaseButton
                onClick={onDisableAll}
                title="Disable all tabs except manager"
              >
                Disable All
              </BaseButton>
            </>
          }
        />
      }
    >
      <DevtoolPanelCard>
        {tabs.length > 0 ? (
          <List
            dense
            divided
          >
            {tabs.map((tab) => (
              <ListItem
                key={tab.id}
                dense
                disabled={tab.id === 'tabs'}
                interactive={tab.id !== 'tabs'}
                onClick={() => {
                  if (tab.id !== 'tabs') {
                    onToggle(tab.id);
                  }
                }}
                prefix={
                  <InputCheckbox
                    checked={isDebugTabEnabled(tab.id)}
                    disabled={tab.id === 'tabs'}
                    aria-label={`Toggle ${resolveTabLabel(tab)} tab`}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggle(tab.id)}
                  />
                }
                suffix={
                  <span className="devtool-tab-manager__meta">
                    <code>{tab.id}</code>
                    <span className="devtool-tab-manager__order">
                      #{tab.order ?? 50}
                    </span>
                  </span>
                }
              >
                {resolveTabLabel(tab)}
              </ListItem>
            ))}
          </List>
        ) : (
          <div className="devtool-tab-manager__empty">
            No registered tabs found.
          </div>
        )}
      </DevtoolPanelCard>
    </DevtoolPanelContainer>
  );
}
