import type { BaseContext } from '@raptor/graphql-api'
import { setContext } from '@raptor/graphql-api'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { DocumentNode, ExecutionArgs, GraphQLSchema } from 'graphql'
import { createHandler as createSSEHandler } from 'graphql-sse'
import {
  createYoga,
  Plugin,
  YogaInitialContext,
  YogaServerOptions,
} from 'graphql-yoga'

type FastifyServerContext = {
  req: FastifyRequest
  reply: FastifyReply
}

export const useYogaFastifyServer = <Context extends BaseContext>(
  instance: FastifyInstance,
  options: Omit<YogaServerOptions<FastifyServerContext, Context>, 'schema'> & {
    schema: GraphQLSchema
    contextFactory: (
      serverContext: YogaInitialContext & FastifyServerContext,
    ) => Context
  },
) => {
  const yogaServer = createYoga<FastifyServerContext, Context>({
    ...options,
    logging: instance.log,
    graphqlEndpoint: instance.prefix,
    context: (initialContext) => {
      try {
        return options.contextFactory(initialContext)
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
      } as Plugin<Context>,
      ...(options.plugins as [Plugin<Context>]),
    ],
  })
  return {
    registerRoute: (url: string) => {
      instance.route({
        url,
        method: ['GET', 'POST', 'OPTIONS'],
        handler: async (req, reply) => {
          try {
            const response = await yogaServer.handleNodeRequest(req, {
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
    },
    registerSSERoute: (url: string) => {
      const sseHandler = createSSEHandler({
        schema: options.schema,
        onSubscribe: async (req, res, params) => {
          const {
            schema, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            execute,
            subscribe,
            contextFactory,
            parse,
            validate,
          } = yogaServer.getEnveloped({
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
        url,
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
    },
  }
}
