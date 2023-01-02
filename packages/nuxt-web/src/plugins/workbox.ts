import type { Plugin } from '@nuxt/types'
import type { Workbox } from 'workbox-window'

export const workboxPlugin: Plugin = async ({ store }) => {
  const workbox = await window.$workbox

  if (!workbox) return

  workbox.addEventListener('installed', (event) => {
    if (!event.isUpdate) return
    store.dispatch('pwa/updated')
  })
}

declare global {
  interface Window {
    $workbox: Promise<Workbox>
  }
}
