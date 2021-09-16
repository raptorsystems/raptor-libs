/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['@raptor/eslint-config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
}
