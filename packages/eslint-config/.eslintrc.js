/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',
    // Prettier
    'plugin:prettier/recommended',
  ],
}
