import { Plugin } from '@yarnpkg/core'

import resolve from './commands/resolve.ts'

const plugin: Plugin = {
  commands: [resolve],
}

export default plugin
