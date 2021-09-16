import type { ContextFactory, UserHeaders } from '@raptor/graphql-api'
import { asyncResourceSymbol, setContext } from '@raptor/graphql-api'
import { logger } from '@raptor/logger'
import { AsyncResource } from 'async_hooks'
import { wrapEmitter } from 'cls-rtracer/src/util'
import type { FastifyPluginCallback } from 'fastify'
import fastifyWebsocket from 'fastify-websocket'
import type { GraphQLSchema } from 'graphql'
import { makeHandler } from 'graphql-ws/lib/use/fastify-websocket'
import { Unauthorized } from 'http-errors'

// graphql-ws server usage with fastify-websocket
// https://github.com/enisdenjo/graphql-ws#with-fastify-websocket

export const graphqlSubscriptions: FastifyPluginCallback<{
  schema: GraphQLSchema
  contextFactory: ContextFactory
}> = (instance, { schema, contextFactory }, next) => {
  void instance.register(fastifyWebsocket)

  instance.get('/graphql', { websocket: true }, async (connection, request) => {
    const asyncResource = request[asyncResourceSymbol] as AsyncResource
    /**
     * Wraps EventEmitter listener registration methods of the
     * given emitter, so that all listeners are run in scope of
     * the provided async resource.
     * https://github.com/puzpuzpuz/cls-rtracer/blob/2745858bc2728d6c54cd05afd36d4be3c357a8f6/src/util.js#L35
     */
    wrapEmitter(connection.socket, asyncResource) // eslint-disable-line @typescript-eslint/no-unsafe-call

    const handler = makeHandler({
      schema,
      onConnect: async ({ connectionParams }) => {
        if (!connectionParams) throw new Error('Missing connectionParams')
        const token = instance.auth0.getToken(connectionParams)
        try {
          await instance.auth0.verifyToken(token)
        } catch (error) {
          handleUnauthorized(error)
          throw error
        }
      },
      context: ({ connectionParams }) => {
        if (!connectionParams) throw new Error('Missing connectionParams')
        const headers = connectionParams as UserHeaders
        const token = instance.auth0.getToken(headers)
        const payload = instance.auth0.decodeToken(token)
        const context = contextFactory(token, payload, headers)
        setContext(context)
        return context
      },
      onError: (_ctx, msg) => {
        logger.error({ msg }, 'GraphQL Subscription Error')
      },
    })

    await handler.bind(instance)(connection, request)
  })

  next()
}

// Workaround to catch Unauthorized errors on client
const handleUnauthorized = <T>(error: T) => {
  if (error instanceof Unauthorized) error.message = 'UNAUTHENTICATED'
}
