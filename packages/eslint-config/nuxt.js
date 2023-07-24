/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    extraFileExtensions: ['.vue'],
  },
  extends: [
    // Nuxt
    // https://github.com/nuxt/eslint-config
    '@nuxt/eslint-config',
    // @nuxt/eslint-config only includes plugin:vue/vue3-recommended
    'plugin:vue/recommended',
    // Vuetify
    // https://github.com/vuetifyjs/eslint-plugin-vuetify
    'plugin:vuetify/recommended',
    // Prettier
    'prettier',
  ],
  rules: {
    // vue
    'vue/html-self-closing': ['error', { html: { void: 'always' } }],
  },
}
