/**
 * OpenID Connect claims for `scope=openid profile email`
 * https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
 * https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export interface UserInfo extends Record<string, unknown> {
  sub: string
  name?: string
  given_name?: string
  family_name?: string
  middle_name?: string
  nickname?: string
  preferred_username?: string
  profile?: string
  picture?: string
  website?: string
  email?: string
  email_verified?: boolean
  gender?: string
  birthdate?: string
  zoneinfo?: string
  locale?: string
  updated_at?: number | string // auth0 returns a string, standard claim is a number
}
