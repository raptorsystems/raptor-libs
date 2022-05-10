export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value != null

// https://github.com/VitorLuizC/bitty/tree/master/packages/nullish

export type Nullish = void | null | undefined

export type NonNullish<T> = T extends Nullish ? never : T

export const isNullish = (value?: unknown): value is Nullish =>
  (value ?? true) === true

export const notNullish = <T>(value?: T): value is NonNullish<T> =>
  !isNullish(value)
