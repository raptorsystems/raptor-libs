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
  private client: Client<true>

  constructor(options: ClientOptions<true>) {
    super()
    this.client = createClient(options)
  }

  public request = (operation: Operation) =>
    new Observable<FetchResult>((sink) =>
      this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          // @ts-expect-error, bad type on graphql-sse https://github.com/enisdenjo/graphql-sse/issues/108#issuecomment-2413586689
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
    lazy: false, // ? prevents multiple connections from reconnecting simultaneously
    headers: async () => {
      const headers = await requestHandler.authorize(
        ctxHeaders?.(context) ?? {},
      )
      return { ...headers }
    },
    on: {
      connecting: (reconnecting) => {
        if (context.isDev) console.log('SSE connecting', { reconnecting })
      },
      connected: (reconnecting) => {
        if (context.isDev) console.log('SSE connected', { reconnecting })
      },
      message: (message) => {
        if (context.isDev) console.log('SSE message', message)
      },
    },
    retryAttempts: Infinity,
  })

  return sseLink
}
