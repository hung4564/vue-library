import type { DatasetSourceSnippet } from './source-snippets';

const REGISTRY = new Map<string, DatasetSourceSnippet>();

export function registerViewSourceSnippet(snippet: DatasetSourceSnippet): void {
  REGISTRY.set(snippet.listName, snippet);
}

export function registerFactoryViewSource(options: {
  listName: string | string[];
  title: string;
  factory: (...args: any[]) => unknown;
  exampleData?: unknown;
  exampleDataUsage?: string;
  preface?: string;
}): void {
  const names = Array.isArray(options.listName)
    ? options.listName
    : [options.listName];
  const factoryName = options.factory.name || 'factory';
  const definition = [
    options.preface,
    `/** Demo factory: ${factoryName} */`,
    options.factory.toString(),
    '',
    '// Usage:',
    `// import { ${factoryName} } from '@hungpvq/demo-map-datasets';`,
    `// const dataset = ${factoryName}(...args);`,
  ]
    .filter((line) => line !== undefined && line !== '')
    .join('\n');

  const exampleData =
    options.exampleData === undefined
      ? undefined
      : typeof options.exampleData === 'string'
        ? options.exampleData
        : JSON.stringify(options.exampleData, null, 2);

  for (const listName of names) {
    registerViewSourceSnippet({
      listName,
      title: options.title,
      definition,
      ...(exampleData
        ? {
            exampleData,
            exampleDataUsage:
              options.exampleDataUsage ??
              `Passed into ${factoryName}(...); see markers // ← Example data tab in definition when curated.`,
          }
        : {}),
    });
  }
}

export function getRegisteredViewSourceSnippet(
  listName: string,
): DatasetSourceSnippet | undefined {
  return REGISTRY.get(listName);
}

/** All registered list names (for tests / audits). */
export function listRegisteredViewSourceNames(): string[] {
  return [...REGISTRY.keys()].sort();
}
