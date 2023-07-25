/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '@raptor/eslint-config',
    'plugin:@typescript-eslint/recommended-type-checked',
  ],
  rules: {
    // @typescript-eslint
    '@typescript-eslint/no-redundant-type-constituents': 'off',
  },
}
