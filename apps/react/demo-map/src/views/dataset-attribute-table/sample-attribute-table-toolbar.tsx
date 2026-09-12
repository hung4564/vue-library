import {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  type AttributeTableToolbarProps,
} from '@hungpvq/map-dataset/attribute-table';
import { AttributeTableToolbar } from '@hungpvq/react-map-dataset';

export function SampleAttributeTableToolbar(props: AttributeTableToolbarProps) {
  return (
    <div className="sample-at-part">
      <div className="sample-at-part__banner sample-at-part__banner--toolbar">
        <code>{ATTRIBUTE_TABLE_COMPONENT_KEY.toolbar}</code>
      </div>
      <AttributeTableToolbar {...props} />
      <style>{`
        .sample-at-part { display: flex; flex-direction: column; }
        .sample-at-part__banner {
          padding: 4px 10px;
          font-size: 11px;
          border-bottom: 1px solid #f0c98a;
          background: #fff4e6;
          color: #4a2c0a;
        }
        .sample-at-part__banner code { font-size: 10px; }
      `}</style>
    </div>
  );
}
