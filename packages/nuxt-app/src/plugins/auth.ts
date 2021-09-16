/* eslint-disable camelcase */
import type { Plugin } from '@nuxt/types'
import type { UserInfo } from '../types'

export interface UserPlugin<AppMetadata, UserMetadata> extends UserInfo {
  namespace: <T>(key: string) => T
  app_metadata: AppMetadata
  user_metadata: UserMetadata
}

export const authPlugin =
  <AppMetadata, UserMetadata>(
    injectUser?: (
      user: UserPlugin<AppMetadata, UserMetadata>,
      ...args: Parameters<Plugin>
    ) => void,
  ): Plugin =>
  (context, inject) => {
    const authUser = context.$auth.user as UserInfo | null

    if (!authUser) {
      inject('user', null)
      return
    }

    const user: UserPlugin<AppMetadata, UserMetadata> = {
      ...authUser,
      namespace<T>(key: string) {
        const namespace = context.$config.authNamespace as string
        if (!namespace) throw new Error('Missing config: `authNamespace`')
        return authUser[`${namespace}/${key}`] as T
      },
      get app_metadata() {
        return this.namespace<AppMetadata>('app_metadata')
      },
      get user_metadata() {
        return this.namespace<UserMetadata>('user_metadata')
      },
    }

    if (injectUser) injectUser(user, context, inject)
    else inject('user', user)
  }
