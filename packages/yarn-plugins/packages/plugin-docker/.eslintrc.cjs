/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@raptor/eslint-config/type-checking'],
  ignorePatterns: ['bundles'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
}
