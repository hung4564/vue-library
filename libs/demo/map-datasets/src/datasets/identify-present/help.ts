import { helpI18n } from '../menu/help';

/** Order = LayerControl top→bottom (last loaded first). */
export const IDENTIFY_PRESENT_DEMO_HELP = helpI18n(
  [
    {
      id: 'resolver-toggle',
      title: 'Resolver: toggle global',
      body: 'Zone near Cu Chi. Layer ⋮ menu: toggle “Use custom global resolver” ↔ “Restore default global resolver” (same item). Custom mode forces Identify Result for every hit; restore calls setGlobalIdentifyResolver(identifyResolver).',
    },
    {
      id: 'hit-always-detail',
      title: 'Hit: always detail (first)',
      body: 'Zone near Long An. Builder onSingle/onMultiple = detail. Try: one feature or center overlaps → always opens Detail for the top hit.',
    },
    {
      id: 'hit-always-table',
      title: 'Hit: always table',
      body: 'Zone near Can Tho. onSingle/onMultiple = table. Try: Identify any hit count → Attribute table (rows selected).',
    },
    {
      id: 'hit-detail-result',
      title: 'Hit: single→detail, multi→result',
      body: 'Zone near Tay Ninh. onSingle=detail, onMultiple=result. Try: click one polygon → Detail; click center overlaps → Identify Result panel.',
    },
    {
      id: 'neither',
      title: 'No detail / no table',
      body: 'Zone near My Tho. Try: Identify still hits features, but neither Detail nor Attribute table is present.',
    },
    {
      id: 'table-only',
      title: 'AttributeTable only',
      body: 'Zone near Bien Hoa. Try: Identify → Attribute table works; no layer-detail present.',
    },
    {
      id: 'detail-only',
      title: 'Detail only',
      body: 'Zone near Vung Tau. Try: Identify → Detail works; Attribute table menu is not offered.',
    },
    {
      id: 'detail-table',
      title: 'Detail + AttributeTable',
      body: 'Zone near Q1 HCMC (auto policy). Try: Identify a polygon → open Detail and Attribute table from present menus (both available).',
    },
  ],
  [
    {
      id: 'resolver-toggle',
      title: 'Resolver: bật/tắt global',
      body: 'Vùng gần Củ Chi. Menu lớp ⋮: cùng một mục đổi nhãn “Use custom…” ↔ “Restore default…” (bấm lại lần nữa). Custom → Identify luôn mở Result; restore gọi setGlobalIdentifyResolver(identifyResolver).',
    },
    {
      id: 'hit-always-detail',
      title: 'Hit: luôn detail (feature đầu)',
      body: 'Vùng gần Long An. Builder onSingle/onMultiple = detail. Thử: một feature hoặc overlap giữa vùng → luôn mở Detail cho hit trên cùng.',
    },
    {
      id: 'hit-always-table',
      title: 'Hit: luôn table',
      body: 'Vùng gần Cần Thơ. onSingle/onMultiple = table. Thử: Identify mọi số lượng hit → Attribute table (chọn sẵn các dòng).',
    },
    {
      id: 'hit-detail-result',
      title: 'Hit: 1→detail, nhiều→result',
      body: 'Vùng gần Tây Ninh. onSingle=detail, onMultiple=result. Thử: click một polygon → Detail; click overlap giữa vùng → panel Identify Result.',
    },
    {
      id: 'neither',
      title: 'Không detail / không table',
      body: 'Vùng gần Mỹ Tho. Thử: Identify vẫn trúng feature, nhưng không có Detail cũng không có Attribute table.',
    },
    {
      id: 'table-only',
      title: 'Chỉ AttributeTable',
      body: 'Vùng gần Biên Hòa. Thử: Identify → Attribute table hoạt động; không có layer-detail.',
    },
    {
      id: 'detail-only',
      title: 'Chỉ Detail',
      body: 'Vùng gần Vũng Tàu. Thử: Identify → Detail hoạt động; không có menu Attribute table.',
    },
    {
      id: 'detail-table',
      title: 'Detail + AttributeTable',
      body: 'Vùng gần Q1 TP.HCM (policy auto). Thử: Identify một polygon → mở Detail và Attribute table từ menu present (cả hai đều có).',
    },
  ],
);
