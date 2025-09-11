import { PackageIndexes } from './types';

export * from './types';

export function getFunctionsSideBar(
  metadata: PackageIndexes,
  props_package: string,
  overwrite: Record<string, any> = {},
) {
  const links: { text: string; items?: any[]; link?: string }[] = [];
  const cache: Record<string, { text: string; items: any[] }> = {};
  const cache_category: Record<string, { text: string; items: any[] }> = {};
  metadata.functions.forEach((temp) => {
    if (
      typeof temp.package !== 'string' ||
      !temp.package.includes(props_package)
    ) {
      return;
    }
    let group = cache[temp.package];
    if (!group) {
      group = {
        text: temp.package,
        items: [],
        order: temp.order,
        ...overwrite[temp.package],
      };
      cache[temp.package] = group;
      links.push(group);
    }
    if (!temp.category) {
      let category = {
        text: temp.name,
        link: temp.docs,
        order: temp.order,
      };
      group.items.push(category);
    } else {
      let category = cache_category[`${temp.package}-${temp.category}`];
      if (!category) {
        category = {
          text: temp.category,
          items: [],
          order: temp.order,
          ...overwrite[`${temp.package}-${temp.category}`],
        };
        cache_category[`${temp.package}-${temp.category}`] = category;
        group.items.push(category);
      }
      category.items.push({
        text: temp.name,
        link: temp.docs,
        order: temp.order,
      });
    }
  });
  for (const key in cache) {
    if (Object.prototype.hasOwnProperty.call(cache, key)) {
      const element = cache[key];
      element.items.sort((a, b) => {
        if (a.order != null && b.order != null) {
          return a.order > b.order ? 1 : -1;
        }
        return a.text > b.text ? 1 : -1;
      });
      if (element.items.length === 1) {
        element.items = element.items[0].items;
      }
    }
  }
  for (const key in cache_category) {
    if (Object.prototype.hasOwnProperty.call(cache_category, key)) {
      const element = cache_category[key];
      element.items.sort((a, b) => {
        if (a.order != null && b.order != null) {
          return a.order > b.order ? 1 : -1;
        }
        return a.text > b.text ? 1 : -1;
      });
    }
  }

  return links;
}
