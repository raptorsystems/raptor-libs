import {
  extraErrorDataIntegration,
  rewriteFramesIntegration,
} from '@sentry/node'
import type { Options } from '@sentry/types'

export const sentryDefaultOptions: Options = {
  // ? Set error depth
  // https://github.com/getsentry/sentry-javascript/issues/1964#issuecomment-625353135
  integrations: [extraErrorDataIntegration({ depth: 9 })],
  normalizeDepth: 10, // depth + 1
}

export const sentryLambdaOptions: Options = {
  ...sentryDefaultOptions,
  integrations: [
    extraErrorDataIntegration({ depth: 9 }),
    rewriteFramesIntegration(),
  ],
}
