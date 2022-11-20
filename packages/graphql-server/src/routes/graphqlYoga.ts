import { useSentry } from '@envelop/sentry'
import type { BaseContext, ContextFactory } from '@raptor/graphql-api'
import { setContext } from '@raptor/graphql-api'
import type {
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import type { DocumentNode, ExecutionArgs, GraphQLSchema } from 'graphql'
import { createHandler as createSSEHandler } from 'graphql-sse'
import { createYoga, Plugin } from 'graphql-yoga'

type ServerContext = {
  req: FastifyRequest
  reply: FastifyReply
}

export const graphqlYoga: FastifyPluginCallback<{
  schema: GraphQLSchema
  graphqlEndpoint?: string
  contextFactory: ContextFactory
}> = (instance, { schema, graphqlEndpoint, contextFactory }, done) => {
  instance.addHook('preValidation', async (req) => {
    const token = instance.auth0.getToken(req.headers)
    await instance.auth0.verifyToken(token)
  })

  const graphQLServer = createYoga<ServerContext, BaseContext>({
    logging: instance.log,
    schema,
    graphqlEndpoint,
    context: ({ req }) => {
      try {
        const token = instance.auth0.getToken(req.headers)
        const payload = instance.auth0.decodeToken(token)
        return contextFactory(token, payload, req.headers)
      } catch (error) {
        instance.log.error(error)
        throw error
      }
    },
    plugins: [
      {
        onContextBuilding({ context }) {
          setContext(context)
        },
      } as Plugin<BaseContext>,
      useSentry({
        configureScope: ({ contextValue }, scope) => {
          const context = contextValue as BaseContext
          scope.setUser({ id: context.user.userId })
          scope.setExtra('user', context.user.payload)
        },
        eventIdKey: null, // ! https://github.com/n1ru4l/envelop/issues/1394
        trackResolvers: false, // ! https://github.com/n1ru4l/envelop/issues/1436
      }),
    ],
  })

  const sseHandler = createSSEHandler({
    schema,
    onSubscribe: async (req, res, params) => {
      const {
        schema, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        execute,
        subscribe,
        contextFactory,
        parse,
        validate,
      } = graphQLServer.getEnveloped({
        req,
        res,
        params,
      })

      const document =
        typeof params.query === 'string'
          ? (parse(params.query) as DocumentNode)
          : params.query

      const args: ExecutionArgs = {
        schema: schema as GraphQLSchema,
        operationName: params.operationName,
        document,
        variableValues: params.variables,
        contextValue: await contextFactory(),
        rootValue: {
          execute,
          subscribe,
        },
      }

      const errors = validate(args.schema, args.document) as Error[]
      if (errors.length) throw errors[0]

      return args
    },
  })

  instance.route({
    url: '/',
    method: ['GET', 'POST', 'OPTIONS'],
    handler: async (req, reply) => {
      try {
        const response = await graphQLServer.handleNodeRequest(req, {
          req,
          reply,
        })
        response.headers.forEach((value, name) => {
          void reply.header(name, value)
        })
        return reply.status(response.status).send(response.body)
      } catch (error) {
        instance.log.error(error)
        throw error
      }
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
        await reply.hijack()
      } catch (error) {
        instance.log.error(error)
        throw error
      }
    },
  })

  done()
}
