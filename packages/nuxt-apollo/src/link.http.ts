import { createHttpLink as createLink } from 'apollo-link-http'
import type { CreateApolloLink } from './types'
import { axiosFetch } from './utils/axios'

export const createHttpLink: CreateApolloLink = (context, ctxHeaders) => {
  const uri = context.$config.apiURL as string
  if (!uri) throw new Error('Missing config: `apiURL`')

  const fetch = axiosFetch(context, ctxHeaders)

  return createLink({ uri, fetch })
}
