import { RetryLink } from 'apollo-link-retry'

export const createRetryLink = (options?: RetryLink.Options) =>
  new RetryLink({
    ...options,
    delay: {
      initial: 100,
      max: 2000,
      jitter: true,
      ...options?.delay,
    },
    attempts: {
      max: 5,
      ...options?.attempts,
    },
  })
