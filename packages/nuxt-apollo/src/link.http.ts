import { BatchHttpLink } from '@apollo/client/link/batch-http'
import type { CreateApolloHttpLink } from './types'
import { axiosFetch } from './utils/axios'

export const createHttpLink: CreateApolloHttpLink = ({
  context,
  ctxHeaders,
  ...options
}) => {
  const url = options?.url ?? (context.$config.apiURL as string)
  if (!url) throw new Error('Missing HttpLink `url`')

  const fetch = axiosFetch(
    () => context.$axios,
    ({ headers, ...config }) => ({
      ...config,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      headers: { ...headers, ...ctxHeaders?.(context) },
    }),
  )

  return new BatchHttpLink({
    uri: url,
    fetch,
    batchMax: 10,
    batchInterval: 20,
    batchDebounce: true,
  })
}
