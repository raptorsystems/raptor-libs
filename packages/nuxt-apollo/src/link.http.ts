import { createHttpLink as createLink } from 'apollo-link-http'
import type { CreateApolloLink } from './types'
import { axiosFetch } from './utils/axios'

export const createHttpLink: CreateApolloLink = (context, ctxHeaders) => {
  const uri = context.$config.apiURL as string
  if (!uri) throw new Error('Missing config: `apiURL`')

  const fetch = axiosFetch(
    () => context.$axios,
    ({ headers, ...config }) => ({
      ...config,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      headers: { ...headers, ...ctxHeaders?.(context) },
    }),
  )

  return createLink({ uri, fetch })
}
