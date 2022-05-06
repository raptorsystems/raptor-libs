import {
  createAxiosHeaders,
  createFetchHeaders,
  getUrl,
} from '@lifeomic/axios-fetch/src/typeUtils'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

export type AxiosTransformer = (
  config: AxiosRequestConfig,
  input: RequestInfo,
  init?: RequestInit,
) => AxiosRequestConfig

// Ref: https://github.com/lifeomic/axios-fetch
export const axiosFetch =
  (
    instance: () => AxiosInstance,
    transformer: AxiosTransformer = (config) => config,
  ): WindowOrWorkerGlobalScope['fetch'] =>
  async (input, init) => {
    // build headers
    const rawHeaders = createAxiosHeaders(init?.headers)
    const lowerCasedHeaders = Object.entries(rawHeaders).reduce<
      Record<string, string>
    >((obj, [name, value]) => ({ ...obj, [name.toLowerCase()]: value }), {})
    if (!('content-type' in lowerCasedHeaders))
      lowerCasedHeaders['content-type'] = 'text/plain;charset=UTF-8'

    // build config
    const rawConfig: AxiosRequestConfig = {
      url: getUrl(input),
      method: init?.method || 'GET',
      data:
        typeof init?.body === 'undefined' || init?.body instanceof FormData
          ? init?.body
          : String(init.body),
      headers: lowerCasedHeaders,
      responseType: 'arraybuffer',
    }

    const config = transformer(rawConfig, input, init)

    let response: AxiosResponse

    try {
      response = await instance().request(config)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) response = error.response
      else throw error
    }

    return new Response(response.data, {
      status: response.status,
      statusText: response.statusText,
      headers: createFetchHeaders(response.headers),
    })
  }
