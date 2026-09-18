import {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  type AttributeTableGridProps,
} from '@hungpvq/map-dataset/attribute-table';
import { AttributeTableGrid } from '@hungpvq/react-map-dataset';

export function SampleAttributeTableGrid(props: AttributeTableGridProps) {
  return (
    <div className="sample-at-part sample-at-part--grid">
      <div className="sample-at-part__banner sample-at-part__banner--grid">
        <code>{ATTRIBUTE_TABLE_COMPONENT_KEY.grid}</code>
      </div>
      <AttributeTableGrid {...props} />
      <style>{`
        .sample-at-part--grid {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          min-height: 0;
          overflow: hidden;
        }
        .sample-at-part__banner {
          flex: 0 0 auto;
          padding: 4px 10px;
          font-size: 11px;
          border-bottom: 1px solid #b7e0cc;
          background: #eef9f3;
          color: #0f3d2e;
        }
        .sample-at-part__banner code { font-size: 10px; }
        .sample-at-part--grid .attribute-table__scroll { background: #fbfefc; }
        .sample-at-part--grid .attribute-table__table th { background: #e7f6ee; }
        .sample-at-part--grid .attribute-table__table tbody tr.is-selected {
          background: #1b7a4e;
        }
      `}</style>
    </div>
  );
}
