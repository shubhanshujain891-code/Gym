import { useSyncExternalStore } from 'react';
import { store } from '../services/store';

export function useStore() {
  useSyncExternalStore(
    (onStoreChange) => store.subscribe(onStoreChange),
    () => store
  );
  return store;
}
