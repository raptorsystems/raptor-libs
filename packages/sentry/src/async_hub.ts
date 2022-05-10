// Ref: Sentry NodeJS with AsyncLocalStorage (from async_hooks)
// https://gist.github.com/jasonk/a06153476ae7fad41c527e321e318088

import { getCurrentHub as _getCurrentHub, Hub } from '@sentry/hub'
import { NodeClient } from '@sentry/node'
import { ScopeContext, Span } from '@sentry/types'
import { getGlobalObject } from '@sentry/utils'
import { AsyncLocalStorage } from 'async_hooks'

// Create an AsyncLocalStorage instance to hold our hubs.
let hub_als: AsyncLocalStorage<Hub>
// Make sure we have a reference to the "main" hub and it's client
const root_hub = _getCurrentHub()
const root_client = root_hub.getClient()

// Find or create the global.__SENTRY__ object the same way Sentry
// does.
const global = getGlobalObject()
global.__SENTRY__ = global.__SENTRY__ ?? {}

// We replace the `hub` property on the global __SENTRY__ object with
// a getter that returns the current hub from the AsyncLocalStorage
// store.
Object.defineProperty(global.__SENTRY__, 'hub', {
  enumerable: true,
  configurable: false,
  get: getCurrentHub,
})

/**
 * Options that you can pass to the makeHub function to pre-configure
 * the returned hub. By providing a Sentry NodeClient instance you
 * can create hubs that are associated with different clients.
 */
export interface MakeHubOptions extends Partial<ScopeContext> {
  client?: NodeClient
  transaction?: string
  span?: Span
}

/**
 * Make a new Sentry hub and attach it to our root_client unless an
 * alternate client was provided.
 */
export function makeSentryHub(options: MakeHubOptions = {}): Hub {
  const { client = root_client, transaction, span, ...opts } = options
  const hub = new Hub(client)
  hub.configureScope((scope) => {
    if (transaction) scope.setTransactionName(transaction)
    if (span) scope.setSpan(span)
    scope.update(opts)
  })
  return hub
}

/**
 * This returns a AsyncLocalStorage instance, not the actual store
 */
export const getSentryHubAsyncStoreInstance = () => {
  if (!hub_als) hub_als = new AsyncLocalStorage<Hub>()
  return hub_als
}

/**
 * Call a function with a newly created Sentry hub. You can also
 * optionally pass an options object to this function to pre-configure
 * the root scope of the newly created hub.
 */
export function withSentryHub<T = unknown>(
  callback: () => T,
  options?: MakeHubOptions,
): T {
  const hub = makeSentryHub(options)
  return getSentryHubAsyncStoreInstance().run(hub, callback)
}

/**
 * This is just exported here for convenience, the normal
 * `getCurrentHub` function from Sentry will also return the same hub
 * thanks to the __SENTRY__ hacking up above.
 */
export function getCurrentHub(): Hub {
  return getSentryHubAsyncStoreInstance().getStore() ?? root_hub
}
