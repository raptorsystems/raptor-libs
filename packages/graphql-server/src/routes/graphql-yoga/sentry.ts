import { defaultSkipError } from '@envelop/sentry'
import { GraphQLError } from 'graphql'

const expectedGraphQLErrorCodes = new Set([
  'BAD_USER_INPUT',
  'UNAUTHENTICATED',
  'FORBIDDEN',
])

export const skipSentryGraphQLError = (error: Error) => {
  if (!(error instanceof GraphQLError)) return defaultSkipError(error)

  const code =
    typeof error.extensions?.code === 'string' ? error.extensions.code : null

  if (code && expectedGraphQLErrorCodes.has(code)) return true

  return defaultSkipError(error)
}
