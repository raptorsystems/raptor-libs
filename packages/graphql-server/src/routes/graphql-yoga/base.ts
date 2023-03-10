import type { BaseContext } from '@raptor/graphql-api'
import { setContext } from '@raptor/graphql-api'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { GraphQLSchema } from 'graphql'

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
      } satisfies Plugin<Context>,
      ...(options.plugins as [Plugin<Context>]),
    ],
  })
  return {
    registerRoute: (url: string) => {
      instance.all(url, {
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
  }
}
