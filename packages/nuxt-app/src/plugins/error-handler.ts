import type { NuxtError, Plugin } from '@nuxt/types'
import type { ApolloError } from '@raptor/nuxt-apollo'
import type { CaptureContext } from '@sentry/types'
import * as Sentry from '@sentry/vue'

type NullableError = NuxtError | ApolloError | null | undefined
type ErrorCode = string | number

interface ErrorHandler {
  hasCode: (error: NullableError, code: ErrorCode) => boolean
  isInformational: (error: NullableError) => boolean
  isSuccess: (error: NullableError) => boolean
  isRedirection: (error: NullableError) => boolean
  isClientError: (error: NullableError) => boolean
  isServerError: (error: NullableError) => boolean
  isUnauthorized: (error: NullableError) => boolean
  isForbidden: (error: NullableError) => boolean
  is404: (error: NullableError) => boolean
  hasNetworkError: (error: NullableError) => boolean
  hasGraphQLError: (error: NullableError) => boolean
  capture: (
    error: NullableError,
    captureContext?: CaptureContext,
  ) => string | undefined
}

const hasCode = (error: NullableError, fn: (code?: ErrorCode) => boolean) => {
  if (!error) return false
  const codeOnStatusCode =
    'statusCode' in error && error.statusCode ? fn(error.statusCode) : false
  const codeOnMessage =
    'message' in error && error.message ? fn(error.message) : false
  const codeOnGraphQLErrors = error.graphQLErrors?.some((graphQLError) =>
    fn(graphQLError.extensions?.code as ErrorCode | undefined),
  )
  const codeOnNetworkError =
    error.networkError && 'statusCode' in error.networkError
      ? fn(error.networkError.statusCode)
      : false
  return (
    codeOnStatusCode ||
    codeOnMessage ||
    codeOnGraphQLErrors ||
    codeOnNetworkError
  )
}

const hasCodeEquals = (error: NullableError, code: ErrorCode) =>
  hasCode(error, (value) => value === code)

const hasCodeIncludes = (error: NullableError, ...codes: ErrorCode[]) =>
  hasCode(error, (value) => (value ? codes.includes(value) : false))

const hasCodeRegex = (error: NullableError, pattern: string | RegExp) =>
  hasCode(error, (value) =>
    value ? new RegExp(pattern).test(value.toString()) : false,
  )

export const errorHandlerPlugin: Plugin = ({ isDev }, inject) => {
  const handler: ErrorHandler = {
    hasCode: hasCodeEquals,

    isInformational: (error) => hasCodeRegex(error, /^1[0-9]{2}$/),

    isSuccess: (error) => hasCodeRegex(error, /^2[0-9]{2}$/),

    isRedirection: (error) => hasCodeRegex(error, /^3[0-9]{2}$/),

    isClientError: (error) =>
      hasCodeEquals(error, 'BAD_USER_INPUT') ||
      hasCodeRegex(error, /^4[0-9]{2}$/),

    isServerError: (error) =>
      hasCodeEquals(error, 'INTERNAL_SERVER_ERROR') ||
      hasCodeRegex(error, /^5[0-9]{2}$/),

    isUnauthorized: (error) => hasCodeIncludes(error, 'UNAUTHENTICATED', 401),

    isForbidden: (error) => hasCodeIncludes(error, 'FORBIDDEN', 403),

    is404: (error) => hasCodeEquals(error, 404),

    hasNetworkError: (error) => Boolean(error?.networkError),

    hasGraphQLError: (error) => Boolean(error?.graphQLErrors?.length),

    capture(error, captureContext) {
      if (isDev) console.error(error, captureContext)
      if (!error) return
      // ignore expected errors
      if (this.isUnauthorized(error)) return
      // capture graphQLErrors
      if (error.graphQLErrors) {
        for (const graphQLError of error.graphQLErrors) {
          if (!graphQLError.extensions?.reported)
            return Sentry.captureException(graphQLError, captureContext)
        }
      }
      // capture networkError
      if (error.networkError) {
        return Sentry.captureException(error.networkError)
      }
    },
  }
  // combined inject into $errorHandler
  inject('errorHandler', handler)
}

declare module 'vue/types/vue' {
  interface Vue {
    $errorHandler: ErrorHandler
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $errorHandler: ErrorHandler
  }
}

declare module 'vuex/types/index' {
  // @ts-expect-error
  interface Store {
    $errorHandler: ErrorHandler
  }
}
