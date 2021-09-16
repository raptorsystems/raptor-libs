import type { Context } from '@nuxt/types'

export const parseHeaders = (headers: HeadersInit): Record<string, string> => {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  } else if (Array.isArray(headers)) {
    return Object.fromEntries(headers) as Record<string, string>
  } else {
    return headers
  }
}

export const headers = (
  context: Context,
  initHeaders?: HeadersInit,
): Record<string, string> => ({
  ...(initHeaders && parseHeaders(initHeaders)),
  ...(context.nuxtState.headers as Record<string, string> | undefined),
})
