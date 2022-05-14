import { getAsyncStoreInstance } from '@raptor/graphql-api'
import { AsyncLocalStorage, AsyncResource } from 'async_hooks'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

type GetAsyncStore<T> = () => AsyncLocalStorage<T>
type GetStore<T> = () => T

export interface AsyncContextOptions<T> {
  getAsyncStore: GetAsyncStore<T>
  getStore: GetStore<T>
  asyncResourceKey: string
}

const requestContext =
  <T>({
    getAsyncStore,
    getStore,
    asyncResourceKey,
  }: AsyncContextOptions<T>): FastifyPluginCallback =>
  (instance, _opts, done) => {
    const asyncResourceSymbol = Symbol(asyncResourceKey)

    // Setup request-scoped context, based on Async hooks
    // ref: https://github.com/fastify/fastify-request-context
    void instance.addHook('onRequest', (req, _res, done) => {
      getAsyncStore().run(getStore(), () => {
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

export const apiRequestContextPlugin = fp(
  requestContext({
    getAsyncStore: getAsyncStoreInstance,
    getStore: () => new Map(),
    asyncResourceKey: 'apiContext',
  }),
)
