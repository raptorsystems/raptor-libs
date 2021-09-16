import { Plugin } from '@nuxt/types'

export const vuetifyColorModePlugin: Plugin = ({ $vuetify, $colorMode }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  $colorMode.$watch('value', {
    immediate: true,
    handler(value: 'dark' | 'light' | 'system') {
      $vuetify.theme.dark = value === 'dark'
    },
  })
}
