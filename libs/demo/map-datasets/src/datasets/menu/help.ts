/** Copy for Dataset → Menu demo help panel (Vue + React). */
export type DemoHelpSection = {
  id: string;
  title: string;
  body: string;
};

export type DemoHelpLang = 'en' | 'vi';

export function helpI18n(en: DemoHelpSection[], vi: DemoHelpSection[]) {
  return { en, vi } as const;
}

/**
 * One section per LayerControl row (same title as the list name).
 * Order = LayerControl top→bottom (last loaded first; reverse of factories).
 */
export const MENU_DEMO_HELP = helpI18n(
  [
    {
      id: 'chain',
      title: 'Custom menu chain support',
      body: 'Click returns another MenuClick builder (nested chain). Try: either extra icon — first execute/click, then the chained follow-up in the console.',
    },
    {
      id: 'multi',
      title: 'Custom menu with multi action',
      body: 'One button chains several click handlers. Try: press the extra icon — execute → registry → highlight run in sequence (watch the console).',
    },
    {
      id: 'custom',
      title: 'Custom menu support',
      body: 'Hand-built clicks (no map geometry required). Try: fitBounds tuple, execute, registry handler on extra icons; transform tuples on the bottom row (alerts + console).',
    },
    {
      id: 'shared',
      title: 'Shared dataset menus',
      body: 'Defaults live on a shared menu part: for layer (list) + for item (identify / table). Try: row Toggle / Info / Fill bound; Identify a feature → Fly to / Detail (built-in byControl moves Fly to to LayerDetail title).',
    },
    {
      id: 'identify-menu',
      title: 'Layer identify menu',
      body: 'Identify appears as an extra icon and again in ⋮ (location menu). Try: open IdentifyControl, or use the layer Identify menu to run identify for this layer.',
    },
    {
      id: 'dynamic-bound',
      title: 'Dynamic bound (update bbox)',
      body: 'Fill bound reads the bound part; Update bbox toggles getData() between two boxes. Try: Fill bound → Update bbox → Fill bound again and watch the camera jump to the other extent.',
    },
    {
      id: 'custom-toggle',
      title: 'Custom toggle button (per layer)',
      body: 'Overrides ToggleShow with a custom registry componentKey (sample ON/OFF UI). Try: use the custom toggle instead of the default eye icon; Style / Info / Fill bound still work.',
    },
    {
      id: 'default',
      title: 'Default menu support',
      body: 'Built-in layer menus only. Try: ToggleShow, Style edit, Info, and Fill bound on the row (and in ⋮ where applicable).',
    },
    {
      id: 'bycontrol',
      title: 'byControl · LayerDetail title',
      body: 'Shows menu placement that changes per host control. On the layer row: Fill bound + ★ Favorite as extra icons; “List only” only in ⋮. Try: open Identify → click a feature → Detail — Fill bound / Favorite move to the header after-title; Detail / Info / List only stay hidden there.',
    },
  ],
  [
    {
      id: 'chain',
      title: 'Hỗ trợ chuỗi menu tùy chỉnh',
      body: 'Click trả về một MenuClick builder khác (chuỗi lồng nhau). Thử: bấm một trong các icon phụ — trước tiên execute/click, rồi follow-up trong chuỗi hiện trên console.',
    },
    {
      id: 'multi',
      title: 'Menu tùy chỉnh với multi action',
      body: 'Một nút nối nhiều click handler. Thử: bấm icon phụ — execute → registry → highlight chạy lần lượt (xem console).',
    },
    {
      id: 'custom',
      title: 'Hỗ trợ menu tùy chỉnh',
      body: 'Click tự dựng (không cần hình học bản đồ). Thử: tuple fitBounds, execute, registry handler trên icon phụ; tuple transform ở hàng dưới (alert + console).',
    },
    {
      id: 'shared',
      title: 'Menu dataset dùng chung',
      body: 'Mặc định nằm trên menu part dùng chung: for layer (list) + for item (identify / table). Thử: Toggle / Info / Fill bound trên dòng; Identify một feature → Fly to / Detail (byControl có sẵn chuyển Fly to lên tiêu đề LayerDetail).',
    },
    {
      id: 'identify-menu',
      title: 'Menu identify theo lớp',
      body: 'Identify hiện như icon phụ và lại trong ⋮ (location menu). Thử: mở IdentifyControl, hoặc dùng menu Identify của lớp để chạy identify cho lớp này.',
    },
    {
      id: 'dynamic-bound',
      title: 'Bound động (cập nhật bbox)',
      body: 'Fill bound đọc bound part; Update bbox đổi getData() giữa hai hộp. Thử: Fill bound → Update bbox → Fill bound lại và xem camera nhảy sang extent kia.',
    },
    {
      id: 'custom-toggle',
      title: 'Nút toggle tùy chỉnh (theo lớp)',
      body: 'Ghi đè ToggleShow bằng componentKey registry tùy chỉnh (UI ON/OFF mẫu). Thử: dùng toggle tùy chỉnh thay icon mắt mặc định; Style / Info / Fill bound vẫn hoạt động.',
    },
    {
      id: 'default',
      title: 'Hỗ trợ menu mặc định',
      body: 'Chỉ menu lớp có sẵn. Thử: ToggleShow, Style edit, Info và Fill bound trên dòng (và trong ⋮ nếu có).',
    },
    {
      id: 'bycontrol',
      title: 'byControl · tiêu đề LayerDetail',
      body: 'Cho thấy vị trí menu đổi theo host control. Trên dòng lớp: Fill bound + ★ Favorite là icon phụ; “List only” chỉ trong ⋮. Thử: mở Identify → click feature → Detail — Fill bound / Favorite chuyển lên header after-title; Detail / Info / List only vẫn ẩn ở đó.',
    },
  ],
);

/** @deprecated prefer MENU_DEMO_HELP[lang] — keep for compat */
export const MENU_DEMO_HELP_SECTIONS = MENU_DEMO_HELP.en;
