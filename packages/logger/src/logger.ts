// Ref: Redwood Logger
// https://github.com/redwoodjs/redwood/blob/main/packages/api/src/logger/index.ts

import pino from 'pino'
import * as prettyPrint from 'pino-pretty'

export type LogLevel = 'info' | 'query' | 'warn' | 'error'

/**
 * Determines if log environment is development
 */
export const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Determines if log environment is test
 */
export const isTest = process.env.NODE_ENV === 'test'

/**
 * Determines if log environment is production by checking if not development
 */
export const isProduction = !isDevelopment && !isTest

/**
 * Determines if logs should be prettified.
 *
 * Typically if logging to a transport stream or in production
 * logs will not be prettified.
 *
 * In fact, the pino developers note:
 * "We recommend against using pino-pretty in production,
 * and highly recommend installing pino-pretty as a development dependency."
 * See: https://github.com/pinojs/pino-pretty#programmatic-integration
 *
 * One exception to this rule may be Netlify functions logging.
 * Its function logging output readability can benefit from pretty-printing.
 */
export const isPretty = isDevelopment

/**
 * Defines the necessary pretty printing dependency
 */
export const prettifier = prettyPrint

/**
 * List of keys to redact from log
 *
 * As an array, the redact option specifies paths that should have their values redacted from any log output.
 *
 * Each path must be a string using a syntax which corresponds to JavaScript dot and bracket notation.
 *
 * If an object is supplied, three options can be specified:
 *
 *      paths (String[]): Required. An array of paths
 *      censor (String): Optional. A value to overwrite key which are to be redacted. Default: '[Redacted]'
 *      remove (Boolean): Optional. Instead of censoring the value, remove both the key and the value. Default: false
 */
export const redactionsList: string[] | pino.redactOptions = [
  'access_token',
  'accessToken',
  'DATABASE_URL',
  'email',
  'event.headers.authorization',
  'host',
  'jwt',
  'JWT',
  'password',
  'params',
  'secret',
]

/**
 * Determines if log level based on environment variables and
 * development or deployment environment defaults
 *
 * Set `LOG_LEVEL` env to the desired logging level. In order of priority, available levels are:
 *
 * - 'fatal'
 * - 'error'
 * - 'warn'
 * - 'info'
 * - 'debug'
 * - 'trace'
 *
 * The logging level is a __minimum__ level. For instance if `logger.level` is `'info'` then all `'fatal'`, `'error'`, `'warn'`,
 * and `'info'` logs will be enabled.
 *
 * You can pass `'silent'` to disable logging.
 *
 * @default 'warn' in Production
 * @default 'trace' in Development
 * @default 'silent' in Test
 *
 */
export const logLevel: pino.LevelWithSilent | string = (() => {
  if (typeof process.env.LOG_LEVEL !== 'undefined') {
    return process.env.LOG_LEVEL
  } else if (isProduction) {
    return 'warn'
  } else if (isTest) {
    return 'silent'
  } else {
    return 'trace'
  }
})()

/**
 * Defines default options when pretty printing.
 * These can be overridden individually without losing other defaults.
 *
 * Defaults are:
 *
 * - Colorize output when pretty printing
 * - Ignore certain event attributes like hostname and pid for cleaner log statements
 * - Prefix the log output with log level
 * - Use a shorted log message that omits server name
 * - Humanize time in GMT
 * */
export const defaultPrettyPrintOptions: pino.PrettyOptions = {
  colorize: true,
  ignore: 'hostname,pid',
  levelFirst: true,
  messageFormat: false,
  translateTime: true,
}

/**
 * Defines an opinionated base logger configuration that defines
 * how to log and what to ignore.
 *
 * @default logger options are:
 *
 * - Colorize output when pretty printing
 * - Ignore certain event attributes like hostname and pid for cleaner log statements
 * - Prefix the log output with log level
 * - Use a shorted log message that omits server name
 * - Humanize time in GMT
 * - Set the default log level in test to silent, development to trace
 *   and warn in prod
 *   Or set via LOG_LEVEL environment variable
 * - Redact the host and other keys via a set redactionList
 *
 * Pretty Printing Defaults defined in defaultPrettyPrintOptions
 *
 * @see {@link https://github.com/pinojs/pino/blob/master/docs/api.md}
 * @see {@link https://github.com/pinojs/pino-pretty}
 */
export const defaultLoggerOptions: pino.LoggerOptions = {
  prettyPrint: isPretty && defaultPrettyPrintOptions,
  prettifier: isPretty && prettifier,
  level: logLevel,
  redact: redactionsList,
}

/**
 * CreateLoggerOptions defines custom logger options that extend those available in LoggerOptions
 * and can define a destination like a file or other supported pin log transport stream
 *
 * @typedef {Object} CreateLoggerOptions
 * @extends LoggerOptions
 * @property {options} LoggerOptions - options define how to log
 * @property {string | DestinationStream} destination - destination defines where to log
 * @property {boolean} showConfig - Display logger configuration on initialization
 */
export interface CreateLoggerOptions {
  options?: pino.LoggerOptions
  destination?: string | pino.DestinationStream
  showConfig?: boolean
}

/**
 * Creates the logger
 *
 * @param options {CreateLoggerOptions} - Override the default logger configuration
 * @param destination {DestinationStream} - An optional destination stream
 * @param showConfig {Boolean} - Show the logger configuration. This is off by default.
 *
 * @example
 * // Create the logger to log just at the error level
 * createLogger({ options: { level: 'error' } })
 *
 * @example
 * // Create the logger to log to a file
 * createLogger({ destination: { 'var/logs/redwood-api.log' } })
 *
 * @return {BaseLogger} - The configured logger
 */
export const createLogger = ({
  options,
  destination,
  showConfig = false,
}: CreateLoggerOptions): pino.BaseLogger => {
  const hasDestination = typeof destination !== 'undefined'
  const isFile = hasDestination && typeof destination === 'string'
  const isStream = hasDestination && !isFile
  const stream = destination

  // override, but retain default pretty print options
  if (isPretty && options?.prettyPrint) {
    const prettyOptions = {
      prettyPrint: {
        ...(defaultLoggerOptions.prettyPrint as pino.PrettyOptions),
        ...(options.prettyPrint as pino.PrettyOptions),
      },
    }

    delete options.prettyPrint

    options = {
      ...defaultLoggerOptions,
      ...prettyOptions,
      ...options,
    }
  } else {
    options = { ...defaultLoggerOptions, ...options }
  }

  if (showConfig) {
    console.log('Logger Configuration')
    console.log(`isProduction: ${String(isProduction)}`)
    console.log(`isDevelopment: ${String(isDevelopment)}`)
    console.log(`isTest: ${String(isTest)}`)
    console.log(`isPretty: ${String(isPretty)}`)
    console.log(`isFile: ${String(isFile)}`)
    console.log(`isStream: ${String(isStream)}`)
    console.log(`logLevel: ${logLevel}`)
    console.log(`options: ${JSON.stringify(options, null, 2)}`)
    console.log(`destination: ${String(destination)}`)
  }

  if (isFile) {
    if (isProduction) {
      console.warn(
        'Please make certain that file system access is available when logging to a file in a production environment.',
      )
    }

    return pino(options, stream as pino.DestinationStream)
  } else {
    if (isStream && isDevelopment && !isTest) {
      console.warn(
        'Logs will be sent to the transport stream in the current development environment.',
      )
    }

    if (isStream && options.prettyPrint) {
      console.warn(
        'Logs sent to the transport stream are being prettified. This format may be incompatible.',
      )
    }

    return pino(options, stream as pino.DestinationStream)
  }
}
