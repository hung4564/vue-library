import { createStore } from '@hungpvq/shared';
import type { Component } from 'vue';

export type RegistryItem = ((...args: any[]) => any) | Component;
export class UniversalRegistry {
  private static registry = createStore<Map<string, RegistryItem>>(
    'map:registry',
    new Map<string, RegistryItem>(),
  );

  /** Đăng ký item */
  static register(key: string, item: RegistryItem) {
    if (this.registry.has(key)) {
      console.warn(`[UniversalRegistry] Key '${key}' đã tồn tại, sẽ ghi đè`);
    }
    this.registry.set(key, item);
  }

  /** Lấy item theo key */
  static get<T extends RegistryItem = RegistryItem>(
    key: string,
  ): T | undefined {
    return this.registry.get(key) as T | undefined;
  }

  /** Helper cho method */
  static registerMethod(key: string, fn: (...args: any[]) => any) {
    if (!key.startsWith('method:')) key = `method:${key}`;
    this.register(key, fn);
  }

  static getMethod(key: string) {
    if (!key.startsWith('method:')) key = `method:${key}`;
    return this.get<(...args: any[]) => any>(key);
  }

  /** Helper cho component */
  static registerComponent(key: string, comp: Component) {
    if (!key.startsWith('component:')) key = `component:${key}`;
    this.register(key, comp);
  }

  static getComponent(key: string) {
    if (!key.startsWith('component:')) key = `component:${key}`;
    return this.get<Component>(key);
  }

  /** Helper cho menu handler */
  static registerMenuHandler(key: string, fn: (...args: any[]) => any) {
    if (!key.startsWith('menu-handler:')) key = `menu-handler:${key}`;
    this.register(key, fn);
  }

  static getMenuHandler(key: string) {
    if (!key.startsWith('menu-handler:')) key = `menu-handler:${key}`;
    return this.get<(...args: any[]) => any>(key);
  }
}

export function useUniversalRegistry() {
  function get<T = any>(
    type: 'component' | 'method' | 'menu-handler',
    name: string,
    defaultValue?: T,
  ): T | undefined {
    return (UniversalRegistry.get(`${type}:${name}`) || defaultValue) as
      | T
      | undefined;
  }

  return {
    get,
    getComponent(key: string, defaultValue?: Component): Component | undefined {
      return get<Component>('component', key, defaultValue);
    },
    getMenuHandler(
      key: string,
      defaultValue?: (...args: any[]) => any,
    ): ((...args: any[]) => any) | undefined {
      return get<(...args: any[]) => any>('menu-handler', key, defaultValue);
    },
  };
}
