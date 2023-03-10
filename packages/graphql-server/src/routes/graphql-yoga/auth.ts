import { useSentry } from '@envelop/sentry'
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse'
import type { AuthContext, AuthContextFactory } from '@raptor/graphql-api'
import type { FastifyPluginCallback } from 'fastify'
import type { GraphQLSchema } from 'graphql'
import { useYogaFastifyServer } from './base'

export const graphqlYogaAuth: FastifyPluginCallback<{
  schema: GraphQLSchema
  graphiql?: boolean
  contextFactory: AuthContextFactory
}> = (instance, { schema, graphiql, contextFactory }, done) => {
  instance.addHook('preValidation', async (req) => {
    const token = instance.auth0.getToken(req.headers)
    await instance.auth0.verifyToken(token)
  })

  const { registerRoute } = useYogaFastifyServer<AuthContext>(instance, {
    schema,
    graphiql,
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
      useSentry({
        configureScope: ({ contextValue }, scope) => {
          const context = contextValue as AuthContext
          scope.setUser({ id: context.user.userId })
          scope.setExtra('user', context.user.payload)
        },
        eventIdKey: null, // ! https://github.com/n1ru4l/envelop/issues/1394
      }),
      useGraphQLSSE({
        endpoint: '/stream',
      }),
    ],
  })

  registerRoute('/')
  registerRoute('/stream')

  done()
}
