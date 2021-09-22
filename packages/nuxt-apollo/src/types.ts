import type { Context } from '@nuxt/types'
import type { ApolloLink } from 'apollo-link'

export type ContextHeaders = (ctx: Context) => Record<string, string>

export type CreateApolloLink = (
  context: Context,
  ctxHeaders?: ContextHeaders,
) => ApolloLink
