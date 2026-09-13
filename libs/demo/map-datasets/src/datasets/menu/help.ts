/** Copy for Dataset → Menu demo help panel (Vue + React). */
export type DemoHelpSection = {
  id: string;
  title: string;
  body: string;
};

/**
 * One section per LayerControl row (same title as the list name).
 * Order = LayerControl top→bottom (last loaded first; reverse of factories).
 */
export const MENU_DEMO_HELP_SECTIONS: DemoHelpSection[] = [
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
];
