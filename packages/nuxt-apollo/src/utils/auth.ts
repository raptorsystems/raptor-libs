import type { Context } from '@nuxt/types'
import type { Oauth2Scheme } from '@nuxtjs/auth-next'

// Ref: https://github.com/nuxt-community/auth-module/blob/75c20e64cc2bb8d4db7d7fc772432132a1d9e417/src/inc/request-handler.ts
export class RequestHandler<
  Scheme extends Oauth2Scheme,
  Config extends Record<string, string>,
> {
  public context: Context

  public constructor(context: Context) {
    this.context = context
  }

  public get scheme(): Scheme {
    return this.context.$auth.strategy as Scheme
  }

  public async authorize(config: Config): Promise<Config> {
    // Perform scheme checks.
    const { valid, tokenExpired, refreshTokenExpired, isRefreshable } =
      this.scheme.check(true)
    let isValid = valid

    // Refresh token has expired. There is no way to refresh. Force reset.
    if (refreshTokenExpired) {
      this.scheme.reset()
      throw new ExpiredAuthSessionError()
    }

    // Token has expired.
    if (tokenExpired) {
      // Refresh token is not available. Force reset.
      if (!isRefreshable) {
        this.scheme.reset()
        throw new ExpiredAuthSessionError()
      }

      // Refresh token is available. Attempt refresh.
      isValid = await this.scheme
        .refreshTokens()
        .then(() => true)
        .catch(() => {
          // Tokens couldn't be refreshed. Force reset.
          this.scheme.reset()
          throw new ExpiredAuthSessionError()
        })
    }

    // Sync token
    const token = this.scheme.token.get()

    // Scheme checks were performed, but returned that is not valid.
    if (!isValid) {
      // The authorization in the current request is expired.
      // Token was deleted right before this request
      if (!token && this._requestHasAuthorization(config))
        throw new ExpiredAuthSessionError()

      return config
    }

    // Token is valid, let the request pass
    // Fetch updated token and add to current request
    return this._getUpdatedRequestConfig(config, token)
  }

  // ---------------------------------------------------------------
  // Watch requests for token expiration
  // Refresh tokens if token has expired

  private _getUpdatedRequestConfig(config: Config, token: string | boolean) {
    if (typeof token !== 'string') return config
    return { ...config, [this.scheme.options.token.name]: token }
  }

  private _requestHasAuthorization(config: Config): boolean {
    return !!config[this.scheme.options.token.name]
  }
}

// ? Importing this from @nuxtjs/auth-next throws ssr-related errors
// https://github.com/nuxt-community/auth-module/blob/75c20e64cc2bb8d4db7d7fc772432132a1d9e417/src/inc/expired-auth-session-error.ts
export class ExpiredAuthSessionError extends Error {
  constructor() {
    super(
      'Both token and refresh token have expired. Your request was aborted.',
    )
    this.name = 'ExpiredAuthSessionError'
  }
}
