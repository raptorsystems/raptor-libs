import { context } from '@raptor/graphql-api'
import * as Sentry from '@sentry/node'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

const errorHandler: FastifyPluginCallback = (instance, _opts, done) => {
  instance.setErrorHandler((error, request, reply) => {
    Sentry.captureException(error)
    // default handler
    if (reply.statusCode < 500)
      reply.log.info({ res: reply, err: error }, error && error.message)
    else
      reply.log.error({ req: request, res: reply, err: error }, error?.message)
    void reply.send(error)
  })

  done()
}

const contextErrorHandler: FastifyPluginCallback = (instance, _opts, done) => {
  instance.setErrorHandler((error, request, reply) => {
    try {
      context.sentry.captureException(error)
    } catch (contextError) {
      Sentry.captureException(error)
      Sentry.captureException(contextError)
    } finally {
      // default handler
      if (reply.statusCode < 500)
        reply.log.info({ res: reply, err: error }, error && error.message)
      else
        reply.log.error(
          { req: request, res: reply, err: error },
          error?.message,
        )
      void reply.send(error)
    }
  })

  done()
}

export const errorHandlerPlugin = fp(errorHandler)
export const contextErrorHandlerPlugin = fp(contextErrorHandler)
