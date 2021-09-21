import { context } from '@raptor/graphql-api'
import * as Sentry from '@sentry/node'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

const errorHandler: FastifyPluginCallback = (instance, _opts, done) => {
  const defaultErrorHandler = instance.errorHandler

  instance.setErrorHandler((error, request, reply) => {
    Sentry.captureException(error)
    defaultErrorHandler(error, request, reply)
  })

  done()
}

const contextErrorHandler: FastifyPluginCallback = (instance, _opts, done) => {
  const defaultErrorHandler = instance.errorHandler

  instance.setErrorHandler((error, request, reply) => {
    try {
      context.sentry.captureException(error)
    } catch (error_) {
      Sentry.captureException(error)
      Sentry.captureException(error_)
    } finally {
      defaultErrorHandler(error, request, reply)
    }
  })

  done()
}

export const errorHandlerPlugin = fp(errorHandler)
export const contextErrorHandlerPlugin = fp(contextErrorHandler)
