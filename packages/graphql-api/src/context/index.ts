import type { YogaInitialContext } from 'graphql-yoga'
import type { SentryService } from '../services/sentry.service.ts'
import type { UserService } from '../services/user.service.ts'
import type { UserHeaders, UserPayload } from '../types.ts'
import type { GlobalContext } from './context.ts'

import './global.api-auto-import.ts'

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

export * from './context.ts'

export * from './store.ts'
