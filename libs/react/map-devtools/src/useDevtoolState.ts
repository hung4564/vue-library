import { useSyncExternalStore } from 'react';
import { getDevtoolState, subscribeDevtoolState } from './store';

export function useDevtoolState() {
  return useSyncExternalStore(subscribeDevtoolState, getDevtoolState, getDevtoolState);
}
