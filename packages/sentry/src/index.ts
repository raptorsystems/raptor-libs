import { ExtraErrorData } from '@sentry/integrations'
import { RewriteFrames } from '@sentry/integrations'
import type { Options } from '@sentry/types'

export const sentryDefaultOptions: Options = {
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.SENTRY_ENVIRONMENT ?? 'dev',
  // ? Set error depth
  // https://github.com/getsentry/sentry-javascript/issues/1964#issuecomment-625353135
  integrations: [new ExtraErrorData({ depth: 9 })],
  normalizeDepth: 10, // depth + 1
}

export const sentryLambdaOptions = {
  ...sentryDefaultOptions,
  enabled: process.env.IS_OFFLINE !== 'true',
  integrations: [new ExtraErrorData({ depth: 9 }), new RewriteFrames()],
}
