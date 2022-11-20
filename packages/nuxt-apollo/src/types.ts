import type { ApolloLink } from '@apollo/client/core'
import type { HTTPExecutorOptions } from '@graphql-tools/executor-http'
import type { Context } from '@nuxt/types'

export type ContextHeaders = (ctx: Context) => Record<string, string>

export type CreateApolloHttpLink = (
  options: HTTPExecutorOptions & {
    context: Context
    ctxHeaders?: ContextHeaders
  },
) => ApolloLink
