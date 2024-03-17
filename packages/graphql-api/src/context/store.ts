// Ref: Redwood context
// https://github.com/redwoodjs/redwood/blob/main/packages/context/src/store.ts

import { AsyncLocalStorage } from 'async_hooks'

import type { GlobalContext } from './context.ts'

let CONTEXT_STORAGE: AsyncLocalStorage<Map<string, GlobalContext>>

/**
 * This returns a AsyncLocalStorage instance, not the actual store.
 * Should not be used by Redwood apps directly. The framework handles
 * this.
 */
export const getAsyncStoreInstance = () => {
  if (!CONTEXT_STORAGE) {
    CONTEXT_STORAGE = new AsyncLocalStorage<Map<string, GlobalContext>>()
  }
  return CONTEXT_STORAGE
}
