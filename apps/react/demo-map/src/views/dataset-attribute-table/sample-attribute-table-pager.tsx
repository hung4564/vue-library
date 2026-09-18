import {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  type AttributeTablePagerProps,
} from '@hungpvq/map-dataset/attribute-table';
import { AttributeTablePager } from '@hungpvq/react-map-dataset';

export function SampleAttributeTablePager(props: AttributeTablePagerProps) {
  return (
    <div className="sample-at-part">
      <div className="sample-at-part__banner sample-at-part__banner--pager">
        <code>{ATTRIBUTE_TABLE_COMPONENT_KEY.pager}</code>
        {' · '}
        <code>
          {`list({ intent: 'page', page: ${props.page}, pageSize: ${props.pageSize} })`}
        </code>
      </div>
      <AttributeTablePager {...props} />
      <style>{`
        .sample-at-part { display: flex; flex-direction: column; }
        .sample-at-part__banner {
          padding: 4px 10px;
          font-size: 11px;
          border-top: 1px solid #c5daf0;
          background: #eef5fc;
          color: #1a3a5c;
        }
        .sample-at-part__banner code { font-size: 10px; }
      `}</style>
    </div>
  );
}
