import type { Plugin } from '@nuxt/types'
import {
  ask,
  Ask,
  Beacon,
  BeaconConfigOptions,
  bootstrap,
  loadScript,
  WeakBeacon,
} from '@raptor/helpscout-beacon'

export interface HelpscoutBeaconPluginOptions {
  config: BeaconConfigOptions
  injectBeacon?: (beacon: WeakBeacon, ...args: Parameters<Plugin>) => void
  onNuxtReady?: (beacon: WeakBeacon, ...args: Parameters<Plugin>) => void
}

export type HelpscoutBeaconPlugin = (
  opts: HelpscoutBeaconPluginOptions,
) => Plugin

export const helpscoutBeaconPlugin: HelpscoutBeaconPlugin =
  ({ config, injectBeacon, onNuxtReady }) =>
  (context, inject) => {
    const { $config } = context

    if (!process.client) return
    if (!$config.helpscoutBeaconId)
      throw new Error('Missing config: `helpscoutBeaconId`')

    bootstrap()

    const beacon: WeakBeacon = (method, options, data) => {
      window.Beacon(method, options, data)
    }

    beacon.ask = ask

    if (injectBeacon) injectBeacon(beacon, context, inject)
    else inject('beacon', beacon)

    window.onNuxtReady(() => {
      beacon('init', $config.helpscoutBeaconId)
      beacon('config', config)
      beacon('once', 'ready', () => {
        beacon.ready = true
      })
      onNuxtReady?.(beacon, context, inject)
      loadScript()
    })
  }

declare global {
  interface Window {
    onNuxtReady: (callback: () => void) => void
  }
}

declare module 'vue/types/vue' {
  interface BeaconPlugin extends Beacon {
    ready: boolean
    ask: Ask
  }
  interface Vue {
    $beacon: BeaconPlugin
  }
}

declare module '@nuxt/types' {
  interface BeaconPlugin extends Beacon {
    ready: boolean
    ask: Ask
  }
  interface NuxtAppOptions {
    $beacon: BeaconPlugin
  }
}

declare module 'vuex/types/index' {
  interface BeaconPlugin extends Beacon {
    ready: boolean
    ask: Ask
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  interface Store {
    $beacon: BeaconPlugin
  }
}
