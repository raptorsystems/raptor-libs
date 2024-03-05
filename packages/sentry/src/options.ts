import sentryIntegrations from '@sentry/integrations'
import type { Options } from '@sentry/types'

export const sentryDefaultOptions: Options = {
  // ? Set error depth
  // https://github.com/getsentry/sentry-javascript/issues/1964#issuecomment-625353135
  integrations: [sentryIntegrations.extraErrorDataIntegration({ depth: 9 })],
  normalizeDepth: 10, // depth + 1
}

export const sentryLambdaOptions: Options = {
  ...sentryDefaultOptions,
  integrations: [
    sentryIntegrations.extraErrorDataIntegration({ depth: 9 }),
    sentryIntegrations.rewriteFramesIntegration(),
  ],
}
