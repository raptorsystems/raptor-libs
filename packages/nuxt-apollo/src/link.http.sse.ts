import {
  ApolloLink,
  FetchResult,
  Observable,
  Operation,
  split,
} from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { print } from 'graphql'
import type { Client, ClientOptions } from 'graphql-sse'
import { createClient } from 'graphql-sse'
import { createHttpLink } from './link.http'
import type { CreateApolloLink } from './types'
import { RequestHandler } from './utils/auth'

// graphql-sse client usage with Apollo
// Ref: https://github.com/enisdenjo/graphql-sse

class SSELink extends ApolloLink {
  private client: Client

  constructor(options: ClientOptions<true>) {
    super()
    this.client = createClient(options)
  }

  public request = (operation: Operation) =>
    new Observable<FetchResult>((sink) =>
      this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        },
      ),
    )
}

export const createHttpSSELink: CreateApolloLink = (context, ctxHeaders) => {
  const requestHandler = new RequestHandler(context)

  const httpLink = createHttpLink(context, ctxHeaders)

  const url = context.$config.apiSSEURL as string
  if (!url) throw new Error('Missing config: `apiSSEURL`')

  const sseLink = new SSELink({
    url,
    singleConnection: true,
    headers: async () => {
      const headers = await requestHandler.authorize(ctxHeaders?.(context))
      return { ...headers }
    },
  })

  return split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    sseLink,
    httpLink,
  )
}
