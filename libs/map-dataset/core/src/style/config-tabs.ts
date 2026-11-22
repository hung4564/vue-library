import type { ArrayIndexTab, ChoseTab, SelectTab, Tab } from './type/style';

/**
 * Shared non-UI tab config (props + formatters). Adapters supply `component`
 * via {@link buildConfigTabs}.
 */
export const CONFIG_TAB_BASE: Record<
  string,
  Omit<Partial<Tab>, 'component'>
> = {
  'array-index': {
    props: {
      content: (tab: ArrayIndexTab) => ({
        items: tab.data,
      }),
    },
  },
  multiple: {
    props: {},
  },
  select: {
    props: {
      content: (tab: SelectTab) => ({
        items: tab.items,
      }),
    },
  },
  image: {
    props: {
      content: {},
    },
  },
  color: {
    props: {
      content: {
        disableAlpha: true,
        class: 'tab-content-no-padding',
      },
    },
  },
  boolean: {
    props: {
      content: {},
    },
  },
  chose: {
    props: {
      content: (tab: ChoseTab) => ({
        items: tab.menu,
        class: 'tab-content-padding',
      }),
      label: (tab: ChoseTab) => ({
        format(value: string) {
          return tab.menu.find((x) => x.value === value)?.text;
        },
      }),
    },
  },
  opacity: {
    props: {
      content: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      label: {
        format: (value: number) => `${(+value * 100).toFixed(0)} %`,
      },
    },
    format: (value: unknown) => +(value as number),
  },
  minMax: {
    props: {
      content: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      label: {
        format: (value: number) => `${(+value).toFixed(2)}`,
      },
    },
    format: (value: unknown) => +(value as number),
  },
  unit: {
    props: {
      content: {
        type: 'number',
        min: 0,
      },
    },
    format: (value: unknown) => +(value as number),
  },
  number: {
    props: {
      content: {
        type: 'number',
        min: 0,
      },
    },
    format: (value: unknown) => +(value as number),
  },
  text: {
    props: {
      content: {},
    },
  },
  'array-x-y': {
    props: {},
  },
  default: {
    props: {
      content: {},
    },
  },
};

export type StyleTabComponentMap = Record<
  string,
  NonNullable<Partial<Tab>['component']>
>;

/** Merge shared props/formatters with adapter component factories. */
export function buildConfigTabs(
  components: StyleTabComponentMap,
): Record<string, Partial<Tab>> {
  const out: Record<string, Partial<Tab>> = {};
  for (const key of Object.keys(CONFIG_TAB_BASE)) {
    const base = CONFIG_TAB_BASE[key];
    const component = components[key];
    out[key] = component ? { ...base, component } : { ...base };
  }
  return out;
}
