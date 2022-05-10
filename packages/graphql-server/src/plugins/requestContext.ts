import { AsyncLocalStorage, AsyncResource } from 'async_hooks'
import type { FastifyPluginCallback } from 'fastify'
import { getAsyncStoreInstance } from '@raptor/graphql-api'
import { getSentryHubAsyncStoreInstance, makeSentryHub } from '@raptor/sentry'
import fp from 'fastify-plugin'

type GetAsyncStore<T> = () => AsyncLocalStorage<T>

export interface AsyncContextOptions<T> {
  defaultStoreValues: T
  asyncResourceKey: string
}

const requestContext =
  <T>({
    asyncStore,
    defaultStoreValues,
    asyncResourceKey,
  }: {
    asyncStore: GetAsyncStore<T>
  } & AsyncContextOptions<T>): FastifyPluginCallback<AsyncContextOptions<T>> =>
  (instance, opts, done) => {
    const asyncResourceSymbol = Symbol(
      opts.asyncResourceKey ?? asyncResourceKey,
    )

    // Setup request-scoped context, based on Async hooks
    // ref: https://github.com/fastify/fastify-request-context
    void instance.addHook('onRequest', (req, _res, done) => {
      asyncStore().run(opts.defaultStoreValues ?? defaultStoreValues, () => {
        const asyncResource = new AsyncResource(asyncResourceKey)
        req[asyncResourceSymbol] = asyncResource
        asyncResource.runInAsyncScope(done, req.raw)
      })
    })

    void instance.addHook('preValidation', (req, _res, done) => {
      const asyncResource = req[asyncResourceSymbol] as AsyncResource
      asyncResource.runInAsyncScope(done, req.raw)
    })

    done()
  }

export const apiRequestContext = fp(
  requestContext({
    asyncStore: getAsyncStoreInstance,
    defaultStoreValues: new Map(),
    asyncResourceKey: 'apiContext',
  }),
)

export const sentryRequestContext = fp(
  requestContext({
    asyncStore: getSentryHubAsyncStoreInstance,
    defaultStoreValues: makeSentryHub(),
    asyncResourceKey: 'sentryHubContext',
  }),
)
