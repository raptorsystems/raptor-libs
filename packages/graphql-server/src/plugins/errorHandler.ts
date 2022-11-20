import * as Sentry from '@sentry/node'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

const errorHandler: FastifyPluginCallback = (instance, _opts, done) => {
  const defaultErrorHandler = instance.errorHandler

  instance.setErrorHandler((error, request, reply) => {
    Sentry.configureScope((scope) => {
      if (instance.auth0) {
        try {
          const token = instance.auth0.getToken(request.headers)
          const user = instance.auth0.decodeToken(token)
          scope.setUser({ id: user.sub })
        } catch (error) {
          instance.log.warn(error)
        }
      }
      Sentry.captureException(error)
    })
    defaultErrorHandler(error, request, reply)
  })

  done()
}

export const errorHandlerPlugin = fp(errorHandler)
