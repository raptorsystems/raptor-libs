import {
  ApolloLink,
  FetchResult,
  Observable,
  Operation,
} from '@apollo/client/core'
import { print } from 'graphql'
import type { Client, ClientOptions } from 'graphql-sse'
import { createClient } from 'graphql-sse'
import type { CreateApolloHttpLink } from './types'
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

export const createSSELink: CreateApolloHttpLink = ({
  context,
  ctxHeaders,
  ...options
}) => {
  const requestHandler = new RequestHandler(context)

  const url = options?.url ?? (context.$config.apiSSEURL as string)
  if (!url) throw new Error('Missing SSELink `url`')

  const sseLink = new SSELink({
    url,
    singleConnection: true,
    headers: async () => {
      const headers = await requestHandler.authorize(
        ctxHeaders?.(context) ?? {},
      )
      return { ...headers }
    },
    onMessage: (message) => {
      if (context.isDev) console.log(message.event, message.data)
    },
    retryAttempts: 10,
  })

  return sseLink
}
