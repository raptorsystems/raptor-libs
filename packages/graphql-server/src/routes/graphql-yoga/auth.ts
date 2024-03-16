import { useSentry } from '@envelop/sentry'
import type {
  AuthContext,
  AuthContextFactory,
  PartialContextFactory,
} from '@raptor/graphql-api'
import type { FastifyPluginCallback } from 'fastify'
import type { GraphQLSchema } from 'graphql'
import { useYogaFastifyServer } from './base.ts'

export const withGraphqlYogaAuth =
  <Context extends AuthContext>(): FastifyPluginCallback<{
    schema: GraphQLSchema
    graphiql?: boolean
    contextFactory: AuthContextFactory<Context>
    subscriptionsContextFactory?: PartialContextFactory<Context>
    disposeContext?: (context: Context) => Promise<void>
    disposeSubscriptionsContext?: (context: Partial<Context>) => Promise<void>
  }> =>
  (instance, { contextFactory, ...options }, done) => {
    instance.addHook('preValidation', async (req) => {
      const token = instance.auth0.getToken(req.headers)
      await instance.auth0.verifyToken(token)
    })

    const { registerRoute } = useYogaFastifyServer<Context>(instance, {
      ...options,
      contextFactory: ({ req, ...args }) => {
        const token = instance.auth0.getToken(req.headers)
        const payload = instance.auth0.decodeToken(token)
        return contextFactory({
          token,
          payload,
          headers: req.headers,
          ...args,
        })
      },
      plugins: [
        useSentry<Context>({
          configureScope: ({ contextValue: { user } }, scope) => {
            scope.setUser({ id: user.userId })
            scope.setExtra('user', user.payload)
          },
          eventIdKey: null, // ! https://github.com/n1ru4l/envelop/issues/1394
        }),
      ],
    })

    registerRoute('/')
    registerRoute('/stream')

    done()
  }
