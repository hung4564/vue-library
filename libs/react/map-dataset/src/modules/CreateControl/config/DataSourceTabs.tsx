import type { CreateControlDataTab } from '@hungpvq/map-dataset';
import { CREATE_CONTROL_DEFAULT_DATA_TAB } from '@hungpvq/map-dataset';
import { useEffect, useState, type ReactNode } from 'react';

type DataSourceTabsProps = {
  tabs: CreateControlDataTab[];
  trans: (key: string) => string;
  activeTab?: CreateControlDataTab;
  onActiveTabChange?: (tab: CreateControlDataTab) => void;
  children: Partial<Record<CreateControlDataTab, ReactNode>>;
};

export function DataSourceTabs({
  tabs,
  trans,
  activeTab: activeTabProp,
  onActiveTabChange,
  children,
}: DataSourceTabsProps) {
  const [internalTab, setInternalTab] = useState<CreateControlDataTab>(CREATE_CONTROL_DEFAULT_DATA_TAB);
  const activeTab = activeTabProp ?? internalTab;

  function setActiveTab(tab: CreateControlDataTab) {
    onActiveTabChange?.(tab);
    if (activeTabProp === undefined) {
      setInternalTab(tab);
    }
  }

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(CREATE_CONTROL_DEFAULT_DATA_TAB);
    }
    // Only react when tabs list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  return (
    <div className="create-control-data">
      <div className="create-control-data__tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            className={`create-control-data__tab${activeTab === tab ? ' _active' : ''}`}
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {trans(`map.layer-control.create.tab-${tab}`)}
          </button>
        ))}
      </div>
      <div className="create-control-data__panel" role="tabpanel">
        {children[activeTab]}
      </div>
    </div>
  );
}
