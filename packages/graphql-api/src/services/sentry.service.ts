import * as Sentry from '@sentry/node'
import type { CaptureContext, Scope, SeverityLevel } from '@sentry/types'
import { GraphQLError } from '../errors'
import { UserPayload } from '../types'

export class SentryService {
  private instance: typeof Sentry
  private user: UserPayload

  constructor(user: UserPayload) {
    this.instance = Sentry
    this.user = user
  }

  setUser(scope: Scope) {
    // UserPayload (access_token) doesn't contain more user info
    scope.setUser({ id: this.user.sub })
    scope.setExtra('user', this.user)
  }

  withScope(callback: (scope: Scope) => void) {
    this.instance.withScope((scope) => {
      this.setUser(scope)
      callback(scope)
    })
  }

  captureException(error: Error | string, captureContext?: CaptureContext) {
    if (error instanceof GraphQLError) {
      // check reported prop
      if (error.extensions.reported) return
      // add reported prop
      error.extensions.reported = true
    }
    this.withScope(() => {
      this.instance.captureException(error, captureContext)
    })
  }

  captureMessage(
    message: string,
    captureContext?: CaptureContext | SeverityLevel,
  ) {
    this.withScope(() => {
      this.instance.captureMessage(message, captureContext)
    })
  }
}
