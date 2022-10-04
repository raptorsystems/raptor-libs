import {
  createFetchHeaders,
  getUrl,
  HeadersLike,
} from '@lifeomic/axios-fetch/src/typeUtils'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

export type AxiosTransformer = (
  config: AxiosRequestConfig,
  input: RequestInfo | URL,
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
    const headers = createAxiosHeaders(init?.headers)

    // build config
    const rawConfig: AxiosRequestConfig = {
      url: getUrl(input),
      method: init?.method || 'GET',
      data:
        typeof init?.body === 'undefined' || init?.body instanceof FormData
          ? init?.body
          : String(init.body),
      headers,
      responseType: 'arraybuffer',
    }

    const config = transformer(rawConfig, input, init)

    let response: AxiosResponse

    try {
      response = await instance().request(config)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (!error.response.status) throw error
        response = error.response
      } else throw error
    }

    return new Response(response.data, {
      status: response.status,
      statusText: response.statusText,
      headers: createFetchHeaders(response.headers) as [string, string][],
    })
  }

const isHeaders = (headers: HeadersLike): headers is Headers =>
  'constructor' in headers ? headers.constructor.name === 'Headers' : false

const createAxiosHeaders = (
  headers: HeadersLike = {},
): Record<string, string> => {
  const rawHeaders: Record<string, string> = {}
  if (isHeaders(headers)) {
    headers.forEach((value, name) => {
      rawHeaders[name] = value
    })
  } else if (Array.isArray(headers)) {
    headers.forEach(([name, value]) => {
      if (value) {
        rawHeaders[name!] = value
      }
    })
  } else {
    Object.entries(headers).forEach(([name, value]) => {
      if (value) {
        rawHeaders[name] = value
      }
    })
  }
  return rawHeaders
}
