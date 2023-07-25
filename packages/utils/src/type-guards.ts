export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value != null

// https://github.com/VitorLuizC/bitty/tree/master/packages/nullish

export type Nullish = void | null | undefined

export type NonNullish<T> = T extends Nullish ? never : T

export const isNullish = (value?: unknown): value is Nullish =>
  (value ?? true) === true

export const notNullish = <T>(value?: T): value is NonNullish<T> =>
  !isNullish(value)

// https://www.npmjs.com/package/catch-unknown

export const isError = <T extends Error>(err: unknown): err is T => {
  if (err instanceof Error) return true
  return (
    isObject(err) &&
    typeof err.name === 'string' &&
    typeof err.message === 'string' &&
    (!('stack' in err) || typeof err.stack === 'string') &&
    (!('cause' in err) || isError(err.cause))
  )
}

export const asError = (err: unknown): Error => {
  if (isError(err)) return err
  const name = (isObject(err) && err.constructor.name) || typeof err
  const message = isObject(err) ? errorMessage(err) : String(err)
  const stack =
    isObject(err) && typeof err.stack === 'string' ? err.stack : undefined
  const cause = isObject(err) && 'cause' in err ? asError(err.cause) : undefined
  return { name, message, stack, cause }
}

const errorMessage = (obj: Record<string, unknown>): string => {
  if (typeof obj.message === 'string') return obj.message
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  if (obj.toString !== Object.prototype.toString) return obj.toString()
  try {
    return JSON.stringify(obj)
  } catch {
    return String(obj)
  }
}
