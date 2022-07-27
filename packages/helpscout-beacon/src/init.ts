/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Beacon, WeakBeacon } from './types'

export const loadScript = () => {
  const head = document.head || document.getElementsByTagName('head')[0]
  const script = document.createElement('script')

  script.async = false
  script.defer = true
  script.src = 'https://beacon-v2.helpscout.net'

  head.appendChild(script)
}

export const bootstrap = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let beacon = window.Beacon || function () {}

  window.Beacon = beacon = (
    ...[method, options, data]: Parameters<WeakBeacon>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    window.Beacon.readyQueue?.push({ method, options, data })
  }
  beacon.readyQueue = []
}

declare global {
  interface Window {
    Beacon: Beacon & {
      readyQueue?: { method: any; options?: any; data?: any }[]
    }
  }
}
