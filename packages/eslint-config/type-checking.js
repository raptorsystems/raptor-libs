/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '@raptor/eslint-config',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  rules: {
    // @typescript-eslint
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': [
      'error',
      { ignorePrimitives: { boolean: true, string: true } },
    ],
  },
}
