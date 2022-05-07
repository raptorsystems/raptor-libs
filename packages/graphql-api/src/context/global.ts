// Ref: Redwood globalContext
// https://github.com/redwoodjs/redwood/blob/main/packages/api/src/globalContext.ts

import { AsyncLocalStorage } from 'async_hooks'

export type GlobalContext = Record<string, unknown>

export const asyncResourceSymbol = Symbol('asyncResource')

let GLOBAL_CONTEXT: GlobalContext = {}
let PER_REQUEST_CONTEXT: AsyncLocalStorage<Map<string, GlobalContext>>

export const shouldUseLocalStorageContext = () =>
  process.env.DISABLE_CONTEXT_ISOLATION !== '1'

/**
 * This returns a AsyncLocalStorage instance, not the actual store
 */
export const getAsyncStoreInstance = () => {
  if (!PER_REQUEST_CONTEXT) {
    PER_REQUEST_CONTEXT = new AsyncLocalStorage()
  }
  return PER_REQUEST_CONTEXT
}

export const createContextProxy = () => {
  if (shouldUseLocalStorageContext()) {
    return new Proxy<GlobalContext>(GLOBAL_CONTEXT, {
      get: (_target, property: string) => {
        const store = getAsyncStoreInstance().getStore()
        if (!store) throw new Error('Missing Global Store')
        const ctx = store.get('context')
        if (!ctx) throw new Error('Missing Global Context')
        return ctx[property]
      },
      set: (_target, property: string, newVal) => {
        const store = getAsyncStoreInstance().getStore()
        if (!store) throw new Error('Missing Global Store')
        const ctx = store.get('context')
        if (!ctx) throw new Error('Missing Global Context')
        ctx[property] = newVal
        store.set('context', ctx)
        return true
      },
    })
  } else {
    return GLOBAL_CONTEXT
  }
}

export let context: GlobalContext = createContextProxy()

/**
 * Set the contents of the global context object.
 */
export const setContext = (newContext: GlobalContext): GlobalContext => {
  GLOBAL_CONTEXT = newContext
  if (shouldUseLocalStorageContext()) {
    // re-init the proxy against GLOBAL_CONTEXT,
    // so things like `console.log(context)` is the actual object,
    // not one initialized earlier.
    context = createContextProxy()
    const store = getAsyncStoreInstance().getStore()
    if (!store) throw new Error('Missing Global Store')
    store.set('context', GLOBAL_CONTEXT)
  } else {
    context = GLOBAL_CONTEXT
  }
  return context
}
