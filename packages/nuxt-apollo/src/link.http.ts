import type { Context } from '@nuxt/types'
import type { ApolloLink } from 'apollo-link'
import { createHttpLink as createLink } from 'apollo-link-http'
import { axiosFetch } from './utils/axios'

export const createHttpLink = (context: Context): ApolloLink => {
  const uri = context.$config.apiURL as string
  if (!uri) throw new Error('Missing config: `apiURL`')

  return createLink({
    uri,
    fetch: axiosFetch(context),
  })
}
