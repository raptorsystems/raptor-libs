import type { NuxtError, Plugin } from '@nuxt/types'
import type { ApolloError } from '@raptor/nuxt-apollo'
import type { CaptureContext } from '@sentry/types'

type NullableError = NuxtError | ApolloError | null | undefined
type ErrorCode = string | number
type ApolloGraphQLError = NonNullable<ApolloError['graphQLErrors']>[number]

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
  getMessage: (error: NullableError) => string | undefined
  getMessageParts: (error: NullableError) => {
    code: string | undefined
    details: string | undefined
  }
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

const summarizeGraphQLErrors = (
  graphQLErrors: readonly ApolloGraphQLError[],
) => {
  const firstError = graphQLErrors.find(
    (graphQLError) => !graphQLError.extensions?.reported,
  )

  const codeFor = (graphQLError: ApolloGraphQLError) =>
    typeof graphQLError.extensions?.code === 'string'
      ? graphQLError.extensions.code
      : undefined

  const pathFor = (graphQLError: ApolloGraphQLError) =>
    graphQLError.path?.join(' > ')

  return {
    errorCount: graphQLErrors.length,
    codes: [...new Set(graphQLErrors.map(codeFor).filter(Boolean))],
    paths: [...new Set(graphQLErrors.map(pathFor).filter(Boolean))],
    firstCode: firstError ? codeFor(firstError) : undefined,
    firstMessage: firstError?.message,
    firstPath: firstError ? pathFor(firstError) : undefined,
  }
}

export const errorHandlerPlugin: Plugin = (
  { $sentry, isDev, route },
  inject,
) => {
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

    getMessage: (error) => {
      if (!error) return
      return error.message || error.toString()
    },

    getMessageParts(error) {
      const message = this.getMessage(error)
      if (!message) return { code: undefined, details: undefined }

      const colonIndex = message.indexOf(':')

      if (colonIndex !== -1) {
        const potentialCode = message.slice(0, colonIndex).trim()
        const details = message.slice(colonIndex + 1).trim()
        // check if format is like "error_code: details"
        if (/^[a-z_]+$/.test(potentialCode))
          return { code: potentialCode, details: details }
      }

      const trimmed = message.trim()
      if (/^[a-z_]+$/.test(trimmed))
        return { code: trimmed, details: undefined }

      return { code: undefined, details: trimmed }
    },

    capture(error, captureContext) {
      if (isDev) console.error(error, captureContext)
      if (!error || !$sentry) return
      // ignore expected errors
      if (this.isUnauthorized(error)) return
      if (error.graphQLErrors?.length) {
        const summary = summarizeGraphQLErrors(error.graphQLErrors)
        $sentry.addBreadcrumb({
          category: 'graphql',
          message: 'GraphQL error response',
          level: 'error',
          data: {
            route: route.fullPath,
            ...summary,
          },
        })
      }
      // capture networkError
      if (error.networkError) {
        return $sentry.captureException(error.networkError)
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
