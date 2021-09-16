import { asyncResourceSymbol, getPerRequestContext } from '@raptor/graphql-api'
import { AsyncResource } from 'async_hooks'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

const requestContext: FastifyPluginCallback = (instance, _opts, next) => {
  // Setup request-scoped context, based on Async hooks
  // ref: https://github.com/fastify/fastify-request-context
  void instance.addHook('onRequest', (req, _res, done) => {
    const localAsyncStorage = getPerRequestContext()
    localAsyncStorage.run(new Map(), () => {
      const asyncResource = new AsyncResource('request-context')
      req[asyncResourceSymbol] = asyncResource
      asyncResource.runInAsyncScope(done, req.raw)
    })
  })

  void instance.addHook('preValidation', (req, _res, done) => {
    const asyncResource = req[asyncResourceSymbol] as AsyncResource
    asyncResource.runInAsyncScope(done, req.raw)
  })

  next()
}

export const requestContextPlugin = fp(requestContext)
