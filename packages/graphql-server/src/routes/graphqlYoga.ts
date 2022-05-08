import { useSentry } from '@envelop/sentry'
import { createServer } from '@graphql-yoga/node'
import type { BaseContext, ContextFactory } from '@raptor/graphql-api'
import { setContext } from '@raptor/graphql-api'
import type {
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import type { ExecutionArgs, GraphQLSchema } from 'graphql'
import { createHandler as createSSEHandler } from 'graphql-sse'

const isDev = process.env.NODE_ENV === 'development'

type ServerContext = {
  req: FastifyRequest
  reply: FastifyReply
}

export const graphqlYoga: FastifyPluginCallback<{
  schema: GraphQLSchema
  contextFactory: ContextFactory
}> = (instance, { schema, contextFactory }, done) => {
  instance.addHook('preValidation', async (req) => {
    const token = instance.auth0.getToken(req.headers)
    await instance.auth0.verifyToken(token)
  })

  const graphQLServer = createServer<ServerContext, BaseContext>({
    logging: instance.log,
    schema,
    graphiql: isDev,
    plugins: [
      useSentry({
        configureScope: ({ contextValue }, scope) => {
          const context = contextValue as BaseContext
          scope.setUser({ id: context.user.userId })
          scope.setExtra('user', context.user.payload)
        },
      }),
    ],
    context: ({ req }) => {
      try {
        const token = instance.auth0.getToken(req.headers)
        const payload = instance.auth0.decodeToken(token)
        const context = contextFactory(token, payload, req.headers)
        setContext(context)
        return context
      } catch (error) {
        instance.log.error(error)
        throw error
      }
    },
  })

  const sseHandler = createSSEHandler({
    schema,
    onSubscribe: async (req, res, params) => {
      const { schema, execute, subscribe, contextFactory, parse, validate } =
        graphQLServer.getEnveloped({
          req,
          res,
          params,
        })

      const args: ExecutionArgs = {
        schema,
        operationName: params.operationName,
        document:
          typeof params.query === 'string' ? parse(params.query) : params.query,
        variableValues: params.variables,
        contextValue: await contextFactory(),
        rootValue: {
          execute,
          subscribe,
        },
      }

      const errors = validate(args.schema, args.document)
      if (errors.length) throw errors[0]

      return args
    },
  })

  instance.route({
    url: '/',
    method: ['GET', 'POST', 'OPTIONS'],
    handler: async (req, reply) => {
      const response = await graphQLServer.handleIncomingMessage(req, {
        req,
        reply,
      })
      for (const [name, value] of response.headers) {
        void reply.header(name, value)
      }
      return reply.status(response.status).send(response.body)
    },
  })

  instance.route({
    url: '/stream',
    method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    handler: async (req, reply) => {
      try {
        // set existing headers from reply
        for (const [name, value] of Object.entries(reply.getHeaders())) {
          if (value) reply.raw.setHeader(name, value)
        }
        await sseHandler(req.raw, reply.raw, req.body)
        reply.sent = true
      } catch (error) {
        instance.log.error(error)
        throw error
      }
    },
  })

  done()
}
