import type { Context } from '@nuxt/types'
import type { AxiosRequestConfig, Method } from 'axios'
import axios from 'axios'
import { headers } from './headers'

// Ref: https://github.com/lifeomic/axios-fetch
export const axiosFetch =
  (context: Context): WindowOrWorkerGlobalScope['fetch'] =>
  async (input, init) => {
    const config: AxiosRequestConfig = {
      url: input as string,
      method: (init?.method as Method) || 'GET',
      data:
        typeof init?.body === 'undefined' || init?.body instanceof FormData
          ? init?.body
          : String(init.body),
      headers: headers(context, init?.headers),
      responseType: 'arraybuffer',
    }

    const response = await context.$axios.request(config).catch((error) =>
      axios.isAxiosError(error) // isAxiosError is undefined on $axios
        ? error.response
        : undefined,
    )

    return new Response(response?.data, {
      status: response?.status,
      statusText: response?.statusText,
      headers: new Headers(response?.headers),
    })
  }
