import { AuthenticationError } from '../errors.ts'
import type { UserData, UserHeaders, UserPayload } from '../types.ts'

export class UserService<
  AppMetadata = unknown,
  UserMetadata = unknown,
  Payload extends UserPayload = UserPayload,
  Headers extends UserHeaders = UserHeaders,
> implements UserData<AppMetadata, UserMetadata>
{
  public token: string
  public payload: Payload
  public headers: Headers
  public namespace: string
  public env: string
  public loggedIn = false

  public constructor({
    token,
    payload,
    headers,
    namespace,
    env,
  }: {
    token: string
    payload: Payload
    headers: Headers
    namespace: string
    env: string
  }) {
    // Set auth token
    this.token = token
    this.headers = headers
    this.namespace = namespace
    this.env = env

    // User is set if JWT middleware is successful
    // user corresponds to the decoded token
    this.payload = payload
    if (payload) this.loggedIn = true
  }

  public get userId(): string {
    // User in token payload (default)
    let userId = this.payload.sub
    // Raptor impersonates user
    if (this.isRaptor && this.headers.user) userId = this.headers.user
    // Check user
    if (!userId) throw new AuthenticationError('Invalid userId')
    return userId
  }

  public getClaim = (claim: string) => this.payload[claim]

  public getCustomClaim = (claim: string) =>
    this.payload[`${this.namespace}/${claim}`]

  public get app_metadata(): AppMetadata | undefined | null {
    return this.getCustomClaim('app_metadata') as AppMetadata
  }

  public get user_metadata(): UserMetadata | undefined | null {
    return this.getCustomClaim('user_metadata') as UserMetadata
  }

  public get roles(): string[] | undefined | null {
    return this.getCustomClaim('roles') as string[]
  }

  public hasRole = (scope: string) => Boolean(this.roles?.includes(scope))

  public get isRaptor() {
    return this.hasRole('raptor')
  }

  public get impersonating(): boolean {
    return this.payload.sub !== this.userId
  }
}
