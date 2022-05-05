import type { BaseContext, ContextFactory } from '@raptor/graphql-api'
import { setContext } from '@raptor/graphql-api'
import { logger } from '@raptor/logger'
import { formatApolloErrors, fromGraphQLError } from 'apollo-server-errors'
import type { FastifyPluginCallback } from 'fastify'
import type { ExecutionResult, GraphQLSchema } from 'graphql'
import { getGraphQLParameters, processRequest } from 'graphql-helix'
import type { Request } from 'graphql-helix/dist/types'

const isDev = process.env.NODE_ENV === 'development'

export const formatResult = (
  { errors, ...result }: ExecutionResult,
  { sentry }: BaseContext,
) => ({
  ...result,
  errors:
    errors &&
    formatApolloErrors(
      errors?.map((error) => fromGraphQLError(error)),
      {
        debug: isDev,
        formatter: (error) => {
          logger.error(error)
          sentry.captureException(error)
          return error
        },
      },
    ),
})

export const graphqlHelix: FastifyPluginCallback<{
  schema: GraphQLSchema
  contextFactory: ContextFactory
}> = (instance, { schema, contextFactory }, done) => {
  instance.addHook('preValidation', async (request) => {
    if (request.method === 'POST') {
      const token = instance.auth0.getToken(request.headers)
      await instance.auth0.verifyToken(token)
    }
  })

  instance.post('/', async (req, res) => {
    const request: Request = {
      body: req.body,
      headers: req.headers,
      method: req.method,
      query: req.query,
    }

    const { operationName, query, variables } = getGraphQLParameters(request)
    const token = instance.auth0.getToken(req.headers)
    const payload = instance.auth0.decodeToken(token)
    const context = contextFactory(token, payload, req.headers)
    setContext(context)

    const result = await processRequest({
      operationName,
      query,
      variables,
      request,
      schema,
      contextFactory: () => context,
    })

    if (result.type === 'RESPONSE') {
      void res.headers(result.headers)
      void res.status(result.status)
      void res.send(formatResult(result.payload, context))
    } else if (result.type === 'PUSH') {
      res.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
      })

      req.raw.on('close', () => {
        result.unsubscribe()
      })

      await result.subscribe((result) => {
        const data = JSON.stringify(formatResult(result, context))
        res.raw.write(`data: ${data}\n\n`)
      })
    } else {
      throw new Error(`Unsupported graphql-helix result type: ${result.type}`)
    }
  })

  done()
}
