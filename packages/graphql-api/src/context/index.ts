import { SentryService } from '../services/sentry.service'
import { UserService } from '../services/user.service'
import { UserHeaders, UserPayload } from '../types'
import type { GlobalContext } from './global'
import * as global from './global'

export interface BaseContext<TUserService extends UserService = UserService>
  extends GlobalContext {
  user: TUserService
  sentry: SentryService
}

export type ContextFactory<Context extends BaseContext = BaseContext> = (
  token: string,
  payload: UserPayload,
  headers: UserHeaders,
) => Context

export * from './global'

export const context = global.context as BaseContext
