import { HttpLink } from '@apollo/client/core'
import type { CreateApolloHttpLink } from './types'
import { axiosFetch } from './utils/axios'

export const createHttpLink: CreateApolloHttpLink = ({
  context,
  ctxHeaders,
  ...options
}) => {
  const endpoint = options?.endpoint ?? (context.$config.apiURL as string)
  if (!endpoint) throw new Error('Missing HttpLink `endpoint`')

  const fetch = axiosFetch(
    () => context.$axios,
    ({ headers, ...config }) => ({
      ...config,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      headers: { ...headers, ...ctxHeaders?.(context) },
    }),
  )

  // Use buildHTTPExecutor with YogaLink as ref
  // https://github.com/dotansimha/graphql-yoga/blob/14bc965442b0b2b76b22b215c616ac27fe4dc455/packages/client/apollo-link/src/index.ts
  return new HttpLink({ uri: endpoint, fetch })
}
