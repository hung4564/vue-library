import { createStore } from '@hungpvq/shared';
import { Component } from 'vue';
import { MiddlewareFn } from '../types';
const store = createStore<{
  middleware: Record<string, MiddlewareFn>;
  layout: Record<string, Component>;
}>('route', { middleware: {}, layout: {} });

export function createMiddleware(key: string, fn: MiddlewareFn) {
  store['middleware'][key] = fn;
}

export function getMiddleware(
  key: string | MiddlewareFn | undefined
): MiddlewareFn | undefined {
  if (typeof key == 'string') return store['middleware'][key];
  return key;
}

export function addLayout(key: string, fn: Component) {
  store['layout'][key] = fn;
}

export function getLayout(key: string | undefined): Component | undefined {
  if (typeof key == 'string') return store['layout'][key];
  return key;
}
