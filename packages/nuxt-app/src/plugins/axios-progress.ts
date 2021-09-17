import { Plugin } from '@nuxt/types'
import Axios from 'axios'

/**
 * Overrides `@nuxtjs/axios` default progress implementation
 *
 * @see https://github.com/nuxt-community/axios-module/pull/247#issuecomment-492844054
 */
export const axiosProgressPlugin: Plugin = ({ $axios }) => {
  if (process.server) return

  // A noop loading interface for when $nuxt is not yet ready
  const noopLoading = {
    finish: () => undefined,
    start: () => undefined,
    fail: () => undefined,
    set: () => undefined,
  }

  const $loading = () => {
    const $nuxt = window?.$nuxt
    return $nuxt?.$loading ?? noopLoading
  }

  let currentRequests = 0

  $axios.onRequest(() => {
    currentRequests++

    if (currentRequests === 1) {
      $loading().start?.()
    }
  })

  $axios.onResponse(() => {
    currentRequests--

    if (currentRequests <= 0) {
      currentRequests = 0
      $loading().finish?.()
    }
  })

  $axios.onError((error) => {
    currentRequests--

    if (Axios.isCancel(error)) {
      if (currentRequests <= 0) {
        currentRequests = 0
        $loading().finish?.()
      }
      return
    }

    $loading().fail?.()
    $loading().finish?.()
  })
}
