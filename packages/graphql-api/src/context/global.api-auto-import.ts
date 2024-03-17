// Ref: Redwood context
// https://github.com/redwoodjs/redwood/blob/main/packages/context/src/global.api-auto-imports.ts

import type { GlobalContext } from './context.ts'

declare global {
  const context: GlobalContext
}
