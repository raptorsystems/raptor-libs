import type { ApolloLink, HttpOptions } from '@apollo/client/core'
import type { Context } from '@nuxt/types'

export type ContextHeaders = (ctx: Context) => Record<string, string>

export type CreateApolloHttpLink = (
  options: Omit<HttpOptions, 'uri'> & {
    url?: string
    context: Context
    ctxHeaders?: ContextHeaders
  },
) => ApolloLink
