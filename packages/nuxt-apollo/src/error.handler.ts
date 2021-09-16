import type { Context } from '@nuxt/types'
import type { ErrorResponse } from 'apollo-link-error'

export const errorHandler = (error: ErrorResponse, ctx: Context) => {
  // Redirect to error page
  ctx.error(error)
}

export { ErrorResponse as ApolloErrorResponse }

export default errorHandler

declare module '@nuxt/types' {
  interface NuxtError {
    graphQLErrors?: ErrorResponse['graphQLErrors']
    networkError?: ErrorResponse['networkError']
  }
}
