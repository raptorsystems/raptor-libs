import type { Context } from '@nuxt/types'
import type { FetchResult, Operation } from 'apollo-link'
import { ApolloLink, Observable, split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import type { GraphQLError } from 'graphql'
import { print } from 'graphql'
import type { Client, ClientOptions } from 'graphql-ws'
import { createClient } from 'graphql-ws'
import { createHttpLink } from './link.http'
import { RequestHandler } from './utils/auth'
import { headers } from './utils/headers'

// graphql-ws client usage with Apollo
// Ref: https://github.com/enisdenjo/graphql-ws

class WebSocketLink extends ApolloLink {
  private client: Client

  constructor(options: ClientOptions) {
    super()
    this.client = createClient(options)
  }

  public request(operation: Operation): Observable<FetchResult> {
    return new Observable((sink) => {
      return this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: (err) => {
            if (err instanceof Error) return sink.error(err)
            if (err instanceof CloseEvent)
              return sink.error(
                // reason will be available on clean closes
                new Error(
                  `Socket closed with event ${err.code} ${err.reason}`.trim(),
                ),
              )
            return sink.error(
              new Error(
                (err as GraphQLError[])
                  .map(({ message }) => message)
                  .join(', '),
              ),
            )
          },
        },
      )
    })
  }
}

export const createHttpWsLink = (context: Context): ApolloLink => {
  const requestHandler = new RequestHandler(context)

  const httpLink = createHttpLink(context)

  const url = context.$config.apiWsURL as string
  if (!url) throw new Error('Missing config: `apiWsURL`')

  const wsLink = new WebSocketLink({
    url,
    connectionParams: () => requestHandler.authorize(headers(context)),
  })

  return split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    httpLink,
  )
}
