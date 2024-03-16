import { useSentry } from '@envelop/sentry'
import type {
  BaseContext,
  BaseContextFactory,
  PartialContextFactory,
} from '@raptor/graphql-api'
import type { FastifyPluginCallback } from 'fastify'
import type { GraphQLSchema } from 'graphql'
import { useYogaFastifyServer } from './base.ts'

export const withGraphqlYogaPublic =
  <Context extends BaseContext>(): FastifyPluginCallback<{
    schema: GraphQLSchema
    graphiql?: boolean
    contextFactory: BaseContextFactory<Context>
    subscriptionsPartialContextFactory?: PartialContextFactory<Context>
  }> =>
  (instance, options, done) => {
    const { registerRoute } = useYogaFastifyServer<Context>(instance, {
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
