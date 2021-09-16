// Ref: Redwood globalContext
// https://github.com/redwoodjs/redwood/blob/main/packages/api/src/globalContext.ts

import { AsyncLocalStorage } from 'async_hooks'

export type GlobalContext = Record<string, unknown>

export const asyncResourceSymbol = Symbol('asyncResource')

let GLOBAL_CONTEXT: GlobalContext = {}
let PER_REQUEST_CONTEXT:
  | undefined
  | AsyncLocalStorage<Map<string, GlobalContext>> = undefined

export const usePerRequestContext = () =>
  process.env.SAFE_GLOBAL_CONTEXT !== '1'

export const getPerRequestContext = () => {
  if (!PER_REQUEST_CONTEXT) {
    PER_REQUEST_CONTEXT = new AsyncLocalStorage()
  }
  return PER_REQUEST_CONTEXT
}

export const createContextProxy = () => {
  return new Proxy<GlobalContext>(GLOBAL_CONTEXT, {
    get: (_target, property: string) => {
      const store = getPerRequestContext().getStore()
      if (!store) throw new Error('Missing Global Store')
      const context = store.get('context')
      if (!context) throw new Error('Missing Global Context')
      return context[property]
    },
  })
}

export let context: GlobalContext = createContextProxy()

/**
 * Set the contents of the global context object.
 */
export const setContext = (newContext: GlobalContext): GlobalContext => {
  GLOBAL_CONTEXT = newContext
  if (usePerRequestContext()) {
    // re-init the proxy against GLOBAL_CONTEXT,
    // so things like `console.log(context)` is the actual object,
    // not one initialized earlier.
    context = createContextProxy()
    const store = getPerRequestContext().getStore()
    if (!store) throw new Error('Missing Global Store')
    store.set('context', GLOBAL_CONTEXT)
  } else {
    context = GLOBAL_CONTEXT
  }
  return context
}
