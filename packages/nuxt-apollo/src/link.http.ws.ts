import type { FetchResult, Operation } from 'apollo-link'
import { ApolloLink, Observable, split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import type { GraphQLError } from 'graphql'
import { print } from 'graphql'
import type { Client, ClientOptions } from 'graphql-ws'
import { createClient } from 'graphql-ws'
import { createHttpLink } from './link.http'
import type { CreateApolloLink } from './types'
import { RequestHandler } from './utils/auth'

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
            if (Array.isArray(err))
              // GraphQLError[]
              return sink.error(
                new Error(
                  (err as GraphQLError[])
                    .map(({ message }) => message)
                    .join(', '),
                ),
              )
            if (err instanceof CloseEvent)
              return sink.error(
                new Error(
                  `Socket closed with event ${err.code} ${err.reason || ''}`, // reason will be available on clean closes only
                ),
              )
            return sink.error(err)
          },
        },
      )
    })
  }
}

export const createHttpWsLink: CreateApolloLink = (context, ctxHeaders) => {
  const requestHandler = new RequestHandler(context)

  const httpLink = createHttpLink(context, ctxHeaders)

  const url = context.$config.apiWsURL as string
  if (!url) throw new Error('Missing config: `apiWsURL`')

  const wsLink = new WebSocketLink({
    url,
    connectionParams: () => requestHandler.authorize(ctxHeaders?.(context)),
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
