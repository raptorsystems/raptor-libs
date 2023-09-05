import { useSentry } from '@envelop/sentry'
import type {
  BaseContext,
  BaseContextFactory,
  PartialContextFactory,
} from '@raptor/graphql-api'
import type { FastifyPluginCallback } from 'fastify'
import type { GraphQLSchema } from 'graphql'
import { useYogaFastifyServer } from './base.ts'

export const graphqlYogaPublic: FastifyPluginCallback<{
  schema: GraphQLSchema
  graphiql?: boolean
  contextFactory: BaseContextFactory
  subscriptionsPartialContextFactory?: PartialContextFactory<BaseContext>
}> = (instance, options, done) => {
  const { registerRoute } = useYogaFastifyServer<BaseContext>(instance, {
    ...options,
    plugins: [
      useSentry({
        eventIdKey: null, // ! https://github.com/n1ru4l/envelop/issues/1394
      }),
    ],
  })

  registerRoute('/')
  registerRoute('/stream')

  done()
}
