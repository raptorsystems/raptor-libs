import { Plugin } from '@yarnpkg/core'

import pack from './commands/pack.ts'

const plugin: Plugin = {
  commands: [pack],
}

export default plugin
