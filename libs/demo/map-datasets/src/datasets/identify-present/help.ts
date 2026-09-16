import { helpI18n, type DemoHelpSection } from '../menu/help';

/** Order = LayerControl top→bottom (last loaded first). */
export const IDENTIFY_PRESENT_DEMO_HELP = helpI18n(
  [
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
      body: 'Zone near Q1 HCMC. Try: Identify a polygon → open Detail and Attribute table from present menus (both available).',
    },
  ],
  [
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
      body: 'Vùng gần Q1 TP.HCM. Thử: Identify một polygon → mở Detail và Attribute table từ menu present (cả hai đều có).',
    },
  ],
);

/** @deprecated prefer IDENTIFY_PRESENT_DEMO_HELP[lang] — keep for compat */
export const IDENTIFY_PRESENT_DEMO_HELP_SECTIONS: DemoHelpSection[] =
  IDENTIFY_PRESENT_DEMO_HELP.en;
