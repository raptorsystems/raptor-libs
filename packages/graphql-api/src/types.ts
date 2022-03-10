import type { IncomingHttpHeaders } from 'http'

/** Auth0 `access_token` claims */
export interface UserPayload extends Record<string, unknown> {
  sub: string
  iss: string
  aud: string | string[]
  exp: number
  iat: number
  scope: string
}

export interface UserHeaders extends IncomingHttpHeaders {
  user?: string | undefined
}

export interface UserData<AppMetadata = unknown, UserMetadata = unknown> {
  userId: string
  app_metadata: AppMetadata | undefined | null
  user_metadata: UserMetadata | undefined | null
}
