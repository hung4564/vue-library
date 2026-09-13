import type { DemoHelpSection } from '../menu/help';

/** Order = LayerControl top→bottom (last loaded first). */
export const IDENTIFY_PRESENT_DEMO_HELP_SECTIONS: DemoHelpSection[] = [
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
];
