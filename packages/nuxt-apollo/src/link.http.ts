import { ApolloLink, Observable, RequestHandler } from '@apollo/client/core'
import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { Executor, isAsyncIterable } from '@graphql-tools/utils'
import type { CreateApolloHttpLink } from './types'
import { axiosFetch } from './utils/axios'

export const createHttpLink: CreateApolloHttpLink = ({
  context,
  ctxHeaders,
  ...options
}) => {
  const endpoint = options?.endpoint ?? (context.$config.apiURL as string)
  if (!endpoint) throw new Error('Missing HttpLink `endpoint`')

  const fetch = axiosFetch(
    () => context.$axios,
    ({ headers, ...config }) => ({
      ...config,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      headers: { ...headers, ...ctxHeaders?.(context) },
    }),
  )

  // Use buildHTTPExecutor with YogaLink as ref
  // https://github.com/dotansimha/graphql-yoga/blob/14bc965442b0b2b76b22b215c616ac27fe4dc455/packages/client/apollo-link/src/index.ts
  return new ExecutorLink(buildHTTPExecutor({ endpoint, fetch }))
}

// Reimplement ExecutorLink
// https://github.com/ardatan/graphql-tools/blob/af679198fbc598b6783ae22e2ed9d2421c97616d/packages/executors/apollo-link/src/index.ts
// Original implementation uses @apollo/client, which imports react. Reimplement using @apollo/client/core
const createApolloRequestHandler =
  (executor: Executor): RequestHandler =>
  (operation) =>
    new Observable((observer) => {
      Promise.resolve(
        executor({
          document: operation.query,
          variables: operation.variables,
          operationName: operation.operationName,
          extensions: operation.extensions,
          context: operation.getContext(),
        }),
      )
        .then(async (results) => {
          if (isAsyncIterable(results)) {
            for await (const result of results) {
              if (observer.closed) return
              observer.next(result)
            }
            observer.complete()
          } else if (!observer.closed) {
            observer.next(results)
            observer.complete()
          }
        })
        .catch((error) => {
          if (!observer.closed) {
            observer.error(error)
          }
        })
    })

export class ExecutorLink extends ApolloLink {
  constructor(executor: Executor) {
    super(createApolloRequestHandler(executor))
  }
}
