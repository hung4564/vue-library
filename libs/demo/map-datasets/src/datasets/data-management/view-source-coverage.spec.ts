import { describe, expect, it } from 'vitest';
import {
  EXPECTED_DEMO_LIST_NAMES,
  findMissingViewSourceSnippets,
} from './view-source-coverage';
import { getDatasetSourceSnippet } from './source-snippets';

describe('demo View source coverage', () => {
  it('has a real snippet for every expected demo list name', () => {
    expect(findMissingViewSourceSnippets()).toEqual([]);
  });

  it('curated DM snippets stay preferred over factory registry', () => {
    const snippet = getDatasetSourceSnippet('HTTP paged list');
    expect(snippet.definition).toContain('createDataManagement');
    expect(snippet.definition).not.toContain('Demo factory:');
  });

  it('covers expected list count', () => {
    expect(EXPECTED_DEMO_LIST_NAMES.length).toBeGreaterThan(50);
  });
});
