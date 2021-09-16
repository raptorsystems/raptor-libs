import { createLogger } from './logger'

export const logger = createLogger({
  options: {
    prettyPrint: {
      translateTime: `UTC:yyyy-mm-dd'T'HH:MM:ss'Z'`,
      singleLine: true,
    },
  },
})
