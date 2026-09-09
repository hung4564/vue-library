import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  MAP_CORE_ADAPTER_SHARED_EXPERIMENTAL,
  MAP_CORE_ADAPTER_SHARED_STABLE,
  MAP_DATASET_ADAPTER_SHARED_STABLE,
  MAP_DRAW_ADAPTER_SHARED_STABLE,
  MAP_DUAL_CONTROL_IDS,
} from './parity-catalog';

const here = dirname(fileURLToPath(import.meta.url));
const repoLibs = resolve(here, '../../../..');

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) {
      continue;
    }
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkFiles(full, out);
    } else if (/\.(vue|tsx|ts)$/.test(name) && !name.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

function collectSourceText(adapterRoot: string): string {
  return walkFiles(adapterRoot)
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
}

function parseAllowlistExports(specPath: string): Set<string> {
  const raw = readFileSync(specPath, 'utf8');
  const names = new Set<string>();
  const re = /'([A-Za-z][A-Za-z0-9_]*)'/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw))) {
    names.add(match[1]);
  }
  return names;
}

function assertSubset(
  label: string,
  required: readonly string[],
  actual: Set<string>,
) {
  const missing = required.filter((name) => !actual.has(name));
  expect(missing, `${label} missing shared exports`).toEqual([]);
}

function sourceMentionsControlId(text: string, id: string): boolean {
  if (text.includes(`'${id}'`) || text.includes(`"${id}"`)) return true;
  /** Protocol constants (value lives in `@hungpvq/map-dataset`). */
  const aliases: Record<string, readonly string[]> = {
    mapIdentifyControl: ['IDENTIFY_CONTROL'],
    mapAttributeTable: ['ATTRIBUTE_TABLE_CONTROL'],
  };
  return (aliases[id] ?? []).some((token) => text.includes(token));
}

describe('Vue ↔ React dual-framework parity', () => {
  const vueCore = join(repoLibs, 'vue/map-core/src');
  const reactCore = join(repoLibs, 'react/map-core/src');
  const vueDataset = join(repoLibs, 'vue/map-dataset/src');
  const reactDataset = join(repoLibs, 'react/map-dataset/src');
  const vueDraw = join(repoLibs, 'vue/map-draw/src');
  const reactDraw = join(repoLibs, 'react/map-draw/src');

  it('shared control ids appear in both Vue and React adapter sources', () => {
    const vueText = [
      collectSourceText(vueCore),
      collectSourceText(vueDataset),
      collectSourceText(vueDraw),
    ].join('\n');
    const reactText = [
      collectSourceText(reactCore),
      collectSourceText(reactDataset),
      collectSourceText(reactDraw),
    ].join('\n');

    const missingVue: string[] = [];
    const missingReact: string[] = [];
    for (const id of MAP_DUAL_CONTROL_IDS) {
      if (!sourceMentionsControlId(vueText, id)) missingVue.push(id);
      if (!sourceMentionsControlId(reactText, id)) missingReact.push(id);
    }
    expect({ missingVue, missingReact }).toEqual({
      missingVue: [],
      missingReact: [],
    });
  });

  it('map-core adapters publish shared Stable + Experimental symbols', () => {
    const vue = parseAllowlistExports(
      join(vueCore, 'public-api.spec.ts'),
    );
    const react = parseAllowlistExports(
      join(reactCore, 'public-api.spec.ts'),
    );
    assertSubset('vue-map-core Stable', MAP_CORE_ADAPTER_SHARED_STABLE, vue);
    assertSubset('react-map-core Stable', MAP_CORE_ADAPTER_SHARED_STABLE, react);
    assertSubset(
      'vue-map-core Experimental',
      MAP_CORE_ADAPTER_SHARED_EXPERIMENTAL,
      vue,
    );
    assertSubset(
      'react-map-core Experimental',
      MAP_CORE_ADAPTER_SHARED_EXPERIMENTAL,
      react,
    );
  });

  it('map-dataset adapters publish shared Stable symbols', () => {
    const vue = parseAllowlistExports(
      join(vueDataset, 'public-api.spec.ts'),
    );
    const react = parseAllowlistExports(
      join(reactDataset, 'public-api.spec.ts'),
    );
    assertSubset(
      'vue-map-dataset',
      MAP_DATASET_ADAPTER_SHARED_STABLE,
      vue,
    );
    assertSubset(
      'react-map-dataset',
      MAP_DATASET_ADAPTER_SHARED_STABLE,
      react,
    );
  });

  it('map-draw adapters publish shared Stable symbols', () => {
    const vue = parseAllowlistExports(join(vueDraw, 'public-api.spec.ts'));
    const react = parseAllowlistExports(
      join(reactDraw, 'public-api.spec.ts'),
    );
    assertSubset('vue-map-draw', MAP_DRAW_ADAPTER_SHARED_STABLE, vue);
    assertSubset('react-map-draw', MAP_DRAW_ADAPTER_SHARED_STABLE, react);
  });
});
