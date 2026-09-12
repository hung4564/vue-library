import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  MapControlButton,
  ModuleContainer,
  useMap,
  useShow,
} from '@hungpvq/react-map-core';
import { useState } from 'react';

export type DatasetSourceViewerProps = {
  title?: string;
  listName?: string;
  definition?: string;
  exampleData?: string;
  mapId?: string;
  onClose?: () => void;
};

export function DatasetSourceViewer(props: DatasetSourceViewerProps) {
  const merged = { ...defaultMapProps, ...props };
  const { moduleContainerProps } = useMap(merged);
  const [show, toggleShow] = useShow(true);
  const [tab, setTab] = useState<'definition' | 'example'>('definition');
  const [copied, setCopied] = useState(false);

  const hasExampleData = Boolean(props.exampleData?.trim());
  const activeTab = hasExampleData ? tab : 'definition';
  const code =
    activeTab === 'example' && hasExampleData
      ? props.exampleData ?? ''
      : props.definition ?? '';
  const popupTitle = props.title || props.listName || 'Dataset source';

  function handleClose() {
    toggleShow(false);
    props.onClose?.();
  }

  async function copyCode() {
    try {
      await navigator.clipboard?.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) => (
        <DraggableItemPopup
          show={show}
          width={720}
          height={520}
          title={popupTitle}
          onClose={handleClose}
          onUpdateShow={(v) => {
            if (!v) handleClose();
          }}
          {...bind}
        >
          <div className="demo-source-viewer">
            <div className="demo-source-viewer__toolbar">
              {hasExampleData ? (
                <div className="demo-source-viewer__tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    className={`demo-source-viewer__tab${
                      activeTab === 'definition' ? ' is-active' : ''
                    }`}
                    aria-selected={activeTab === 'definition'}
                    onClick={() => setTab('definition')}
                  >
                    Definition
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`demo-source-viewer__tab${
                      activeTab === 'example' ? ' is-active' : ''
                    }`}
                    aria-selected={activeTab === 'example'}
                    onClick={() => setTab('example')}
                  >
                    Example data
                  </button>
                </div>
              ) : (
                <span className="demo-source-viewer__label">Definition</span>
              )}
              <MapControlButton
                variant="outlined"
                onClick={() => void copyCode()}
              >
                {copied ? 'Copied' : 'Copy'}
              </MapControlButton>
            </div>
            <pre className="demo-source-viewer__code" tabIndex={0}>
              {code}
            </pre>
          </div>
          <style>{`
            .demo-source-viewer {
              display: flex;
              flex-direction: column;
              height: 100%;
              min-height: 0;
              font-size: 12px;
            }
            .demo-source-viewer__toolbar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
              padding: 8px 10px;
              border-bottom: 1px solid #e5e5e5;
            }
            .demo-source-viewer__tabs {
              display: flex;
              gap: 4px;
            }
            .demo-source-viewer__label {
              font-weight: 600;
              color: #444;
            }
            .demo-source-viewer__tab {
              font: inherit;
              padding: 4px 10px;
              cursor: pointer;
              border: 1px solid transparent;
              border-radius: 4px;
              background: transparent;
            }
            .demo-source-viewer__tab.is-active {
              border-color: #c5daf0;
              background: #eef5fc;
              font-weight: 600;
            }
            .demo-source-viewer__code {
              flex: 1;
              margin: 0;
              padding: 10px 12px;
              overflow: auto;
              font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
              font-size: 11px;
              line-height: 1.45;
              white-space: pre;
              background: #f7f8fa;
            }
          `}</style>
        </DraggableItemPopup>
      )}
    />
  );
}
