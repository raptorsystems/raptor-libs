import { getAsyncStoreInstance } from '@raptor/graphql-api'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { AsyncLocalStorage } from 'node:async_hooks'
import { AsyncResource } from 'node:async_hooks'

type GetAsyncStore<T> = () => AsyncLocalStorage<T>
type GetStore<T> = () => T

export interface AsyncContextOptions<T> {
  getAsyncStore: GetAsyncStore<T>
  getStore: GetStore<T>
  asyncResourceKey: string
}

const requestContext = <T>({
  getAsyncStore,
  getStore,
  asyncResourceKey,
}: AsyncContextOptions<T>): FastifyPluginCallback => {
  const asyncResourceSymbol = Symbol(asyncResourceKey)
  const asyncStore = getAsyncStore()
  return (instance, _opts, done) => {
    // Setup request-scoped context, based on Async hooks
    // ref: https://github.com/fastify/fastify-request-context
    void instance.addHook('onRequest', (req, _res, done) => {
      asyncStore.run(getStore(), () => {
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
}

export const apiRequestContextPlugin = fp(
  requestContext({
    getAsyncStore: getAsyncStoreInstance,
    getStore: () => new Map(),
    asyncResourceKey: 'apiContext',
  }),
)
