import { ApolloClient, ApolloClientOptions } from '@apollo/client/core'
import type { Plugin } from '@nuxt/types'
import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { errorHandler } from '@raptor/nuxt-apollo'

export const apolloPlugin =
  <TCacheShape>(options: ApolloClientOptions<TCacheShape>): Plugin =>
  (context, _inject) => {
    const { app } = context

    const client = new ApolloClient(options)

    const apolloProvider = new VueApollo({
      defaultClient: client,
      errorHandler: errorHandler(context),
    })

    Vue.use(VueApollo)

    // Allow access to the provider in the context
    app.apolloProvider = apolloProvider
  }

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    apolloProvider: VueApollo
  }
}
