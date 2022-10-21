/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@raptor/eslint-config/type-checking'],
  env: {
    browser: true,
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
}
