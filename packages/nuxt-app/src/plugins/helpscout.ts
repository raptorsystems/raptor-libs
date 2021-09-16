import type { HelpscoutBeaconPlugin } from '@raptor/nuxt-web'
import { helpscoutBeaconPlugin as plugin } from '@raptor/nuxt-web'
import type { UserInfo } from '../types'

export type IdentifyUser = (args: {
  user: UserInfo
  signature?: string
}) => void

export const identifyUser: IdentifyUser = ({ user, signature }) => {
  window.Beacon('identify', {
    name: user.name !== user.email ? user.name : user.nickname,
    email: user.email,
    avatar: user.picture,
    auth0: user.sub,
    signature,
  })
}

export const helpscoutBeaconPlugin: HelpscoutBeaconPlugin = ({
  config,
  injectBeacon,
}) =>
  plugin({
    config,
    injectBeacon: (beacon, context, inject) => {
      beacon.identifyUser = identifyUser
      if (injectBeacon) injectBeacon(beacon, context, inject)
      else inject('beacon', beacon)
    },
  })

declare module 'vue/types/vue' {
  interface BeaconPlugin {
    identifyUser: IdentifyUser
  }
}

declare module '@nuxt/types' {
  interface BeaconPlugin {
    identifyUser: IdentifyUser
  }
}

declare module 'vuex/types/index' {
  interface BeaconPlugin {
    identifyUser: IdentifyUser
  }
}
