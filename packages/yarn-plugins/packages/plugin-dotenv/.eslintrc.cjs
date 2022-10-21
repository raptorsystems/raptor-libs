/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@raptor/eslint-config/type-checking'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  ignorePatterns: ['bundles'],
  rules: {
    '@typescript-eslint/require-await': 'off',
  },
}
