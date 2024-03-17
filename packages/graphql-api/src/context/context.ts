// Ref: Redwood context
// https://github.com/redwoodjs/redwood/blob/main/packages/context/src/context.ts

import { getAsyncStoreInstance } from './store.ts'

export type GlobalContext = Record<string, unknown>

export const createContextProxy = (target: GlobalContext) => {
  return new Proxy<GlobalContext>(target, {
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
}

export let context: GlobalContext = createContextProxy({})

/**
 * Set the contents of the global context object.
 *
 * This completely replaces the existing context values such as currentUser.
 *
 * If you wish to extend the context simply use the `context` object directly,
 * such as `context.magicNumber = 1`, or `setContext({ ...context, magicNumber: 1 })`
 */
export const setContext = (newContext: GlobalContext): GlobalContext => {
  // re-init the proxy against the new context object,
  // so things like `console.log(context)` is the actual object,
  // not one initialized earlier.
  context = createContextProxy(newContext)

  // Replace the value of context stored in the current async store
  const store = getAsyncStoreInstance().getStore()
  if (!store) throw new Error('Missing Global Store')
  store.set('context', newContext)

  return context
}
