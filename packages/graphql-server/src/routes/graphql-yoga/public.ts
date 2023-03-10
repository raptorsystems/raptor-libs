import { useSentry } from '@envelop/sentry'
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse'
import type { BaseContext, BaseContextFactory } from '@raptor/graphql-api'
import type { FastifyPluginCallback } from 'fastify'
import type { GraphQLSchema } from 'graphql'
import { useYogaFastifyServer } from './base'

export const graphqlYogaPublic: FastifyPluginCallback<{
  schema: GraphQLSchema
  graphiql?: boolean
  contextFactory: BaseContextFactory
}> = (instance, { schema, graphiql, contextFactory }, done) => {
  const { registerRoute } = useYogaFastifyServer<BaseContext>(instance, {
    schema,
    graphiql,
    contextFactory,
    plugins: [
      useSentry({
        eventIdKey: null, // ! https://github.com/n1ru4l/envelop/issues/1394
      }),
      useGraphQLSSE({
        endpoint: '/stream',
      }),
    ],
  })

  registerRoute('/')

  done()
}
