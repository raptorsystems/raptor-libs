import { createLogger, isDevelopment } from './logger.ts'

export const logger = createLogger({
  options: isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'hostname,pid',
            levelFirst: true,
            messageFormat: false,
            translateTime: true,
            singleLine: true,
          },
        },
      }
    : undefined,
})
