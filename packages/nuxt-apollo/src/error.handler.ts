import type { ApolloError } from '@apollo/client/errors'
import type { Context } from '@nuxt/types'

export const errorHandler = (ctx: Context) => (error: ApolloError) => {
  // Redirect to error page
  if (ctx.isDev) console.error(error)
  ctx.error(error)
}

export type { ApolloError }

export default errorHandler

declare module '@nuxt/types' {
  interface NuxtError {
    graphQLErrors?: ApolloError['graphQLErrors']
    networkError?: ApolloError['networkError']
  }
}
