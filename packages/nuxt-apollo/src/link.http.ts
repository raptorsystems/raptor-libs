import { HttpLink } from '@apollo/client/core'
import type { CreateApolloHttpLink } from './types'
import { axiosFetch } from './utils/axios'

export const createHttpLink: CreateApolloHttpLink = ({
  context,
  ctxHeaders,
  ...options
}) => {
  const uri = options?.uri ?? (context.$config.apiURL as string)
  if (!uri) throw new Error('Missing HttpLink `uri`')

  const fetch = axiosFetch(
    () => context.$axios,
    ({ headers, ...config }) => ({
      ...config,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      headers: { ...headers, ...ctxHeaders?.(context) },
    }),
  )

  return new HttpLink({ uri, fetch })
}
