/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    extraFileExtensions: ['.vue'],
  },
  extends: [
    // Nuxt
    // https://typescript.nuxtjs.org/guide/lint.html#lint
    '@nuxtjs/eslint-config-typescript',
    // Vuetify
    // https://github.com/vuetifyjs/eslint-plugin-vuetify
    'plugin:vuetify/recommended',
    // Prettier
    'plugin:prettier/recommended',
  ],
  rules: {
    // vue
    'vue/html-self-closing': ['error', { html: { void: 'always' } }],
  },
}
