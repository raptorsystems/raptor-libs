import { FullStory, init } from '@fullstory/browser'
import { Plugin } from '@nuxt/types'

export const fullStoryPlugin: Plugin = ({ $config, isDev }, inject) => {
  const orgId = $config.fullStoryOrgId as string
  if (!orgId) throw new Error('Missing config: `fullStoryOrgId`')

  init({ orgId, devMode: isDev })

  inject('fullStory', FullStory)
}

declare module 'vue/types/vue' {
  interface Vue {
    $fullStory: typeof FullStory
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $fullStory: typeof FullStory
  }
}

declare module 'vuex/types/index' {
  // @ts-expect-error
  interface Store {
    $fullStory: typeof FullStory
  }
}
