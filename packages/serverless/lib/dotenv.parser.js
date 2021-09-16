/* eslint-disable */

// ? Return parsed elements alongside system env vars, default parser only returns parsed elements
// ref: https://github.com/neverendingqs/serverless-dotenv-plugin/blob/4c8d74a1a88c0ff9f005a59ebcb2f0cc99eaa2d9/src/index.js#L112

module.exports = function ({ dotenv, paths }) {
  for (const path of paths) {
    dotenv.config({ path })
  }
  const { PATH, ...envVars } = process.env // ! including `PATH` results in `Error: spawn yarn ENOENT`
  return envVars
}
