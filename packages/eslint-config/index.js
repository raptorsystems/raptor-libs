/** @type {import('eslint').Linter.Config} */
module.exports = {
  plugins: ['@typescript-eslint'],
  env: {
    es6: true,
    node: true,
  },
  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',
    // ESLint typescript rules
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    // Prettier
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // eslint
    'require-atomic-updates': 'off',
    // @typescript-eslint
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
}
