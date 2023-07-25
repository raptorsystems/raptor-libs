import type { UserHeaders, UserPayload } from '@raptor/graphql-api'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'

type DefaultPayload = Record<string, unknown>

type DecodeToken<T extends DefaultPayload> = (token: string) => T

type VerifyToken<T extends DefaultPayload> = (token: string) => Promise<T>

type GetSecret = (kid: string) => Promise<string>

export const getJwksClient = (domain: string): JwksClient =>
  new JwksClient({
    cache: true,
    jwksUri: jwksUri(domain),
    timeout: 5000,
  })

export function getToken(headers: UserHeaders): string {
  // get auth header
  const authorization = headers.authorization
  if (!authorization)
    throw new createError.Unauthorized('Missing `authorization` header')
  if (Array.isArray(authorization))
    throw new createError.Unauthorized('Invalid `authorization` header')

  // extract token
  const token = authorization.split(/\s+/)[1]?.trim()
  if (!token) throw new createError.Unauthorized('Invalid token')

  return token
}

export const decodeToken = <T>(token: string): T => {
  // decode token
  const decoded = jwt.decode(token)
  if (!decoded || typeof decoded === 'string')
    throw new createError.Unauthorized('Invalid token payload')
  return decoded as T
}

export const getSecret =
  (client: JwksClient): GetSecret =>
  async (kid) => {
    // get secret from jwks
    const key = await client.getSigningKey(kid)
    return key.getPublicKey()
  }

export const verifyToken = async <T extends Record<string, unknown>>(
  token: string,
  audience: string,
  getSecret: GetSecret,
): Promise<T> => {
  // decode token
  const decoded = jwt.decode(token, { complete: true })
  if (!decoded || typeof decoded === 'string')
    throw new createError.Unauthorized('Invalid token payload')

  // get token header.kid
  const header = decoded.header
  if (!header.kid)
    throw new createError.Unauthorized('Token payload missing `kid` header')

  // get secret from jwks
  const secret = await getSecret(header.kid)

  // verify token
  try {
    return jwt.verify(token, secret, { algorithms: ['RS256'], audience }) as T
  } catch (error) {
    let message = 'Invalid token'
    if (error instanceof jwt.JsonWebTokenError)
      message = `${message}: ${error.message}`
    throw new createError.Unauthorized(message)
  }
}

const normalizeDomain = (domain: string): string => {
  const normalized = !domain.match(/^http(?:s?)/g)
    ? `https://${domain}`
    : domain
  return new URL(normalized).toString()
}

const jwksUri = (domain: string) =>
  `${normalizeDomain(domain)}.well-known/jwks.json`

export interface Auth0Options {
  domain: string
  audience: string
}

export const auth0: FastifyPluginCallback<Auth0Options> = (
  instance,
  { domain, audience },
  done,
) => {
  const client = getJwksClient(domain)

  void instance.decorate('auth0', {
    getToken,
    decodeToken,
    verifyToken: (token: string) =>
      verifyToken(token, audience, getSecret(client)),
  })

  done()
}

export const auth0Plugin = fp(auth0)

declare module 'fastify' {
  type Payload = UserPayload

  interface FastifyInstance {
    auth0: {
      getToken: typeof getToken
      decodeToken: DecodeToken<UserPayload>
      verifyToken: VerifyToken<UserPayload>
    }
  }
}
