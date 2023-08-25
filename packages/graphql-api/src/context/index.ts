import { YogaInitialContext } from 'graphql-yoga'
import { SentryService } from '../services/sentry.service'
import { UserService } from '../services/user.service'
import { UserHeaders, UserPayload } from '../types'
import type { GlobalContext } from './global'
import * as global from './global'

export type BaseContext = GlobalContext

export interface AuthContext<TUserService extends UserService = UserService>
  extends BaseContext {
  user: TUserService
  sentry: SentryService
}

export type AuthContextFactory<Context extends AuthContext = AuthContext> = (
  initialContext: YogaInitialContext & {
    token: string
    payload: UserPayload
    headers: UserHeaders
  },
) => Context

export type BaseContextFactory<Context extends BaseContext = BaseContext> = (
  initialContext: YogaInitialContext,
) => Context

export type PartialContextFactory<Context extends BaseContext = BaseContext> =
  () => Partial<Context>

export * from './global'

export const context = global.context
