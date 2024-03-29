// based on ApolloError https://github.com/apollographql/apollo-server/blob/main/packages/apollo-server-errors/src/index.ts
import { GraphQLError } from 'graphql'

export { GraphQLError }

export class SyntaxError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'GRAPHQL_PARSE_FAILED' } })
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'GRAPHQL_VALIDATION_FAILED' } })
  }
}

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'UNAUTHENTICATED' } })
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'FORBIDDEN' } })
  }
}

export class PersistedQueryNotFoundError extends GraphQLError {
  constructor() {
    super('PersistedQueryNotFound', {
      extensions: { code: 'PERSISTED_QUERY_NOT_FOUND' },
    })
  }
}

export class PersistedQueryNotSupportedError extends GraphQLError {
  constructor() {
    super('PersistedQueryNotSupported', {
      extensions: { code: 'PERSISTED_QUERY_NOT_SUPPORTED' },
    })
  }
}

export class UserInputError extends GraphQLError {
  constructor(message: string, properties?: Record<string, unknown>) {
    super(message, { extensions: { code: 'BAD_USER_INPUT', properties } })
  }
}

export function toGraphQLError(
  error: Error & { extensions?: Record<string, unknown> },
  code = 'INTERNAL_SERVER_ERROR',
): Error & { extensions: Record<string, unknown> } {
  const err = error
  if (err.extensions) {
    err.extensions.code = code
  } else {
    err.extensions = { code }
  }
  return err as Error & { extensions: Record<string, unknown> }
}
