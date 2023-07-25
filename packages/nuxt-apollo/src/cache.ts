import type {
  FieldFunctionOptions,
  FieldMergeFunction,
  FieldPolicy,
  FieldReadFunction,
  Reference,
} from '@apollo/client/cache'
import { notNullish } from '@raptor/utils'

type KeyArgs = FieldPolicy<unknown>['keyArgs']

type Args =
  | { id?: string }
  | { where?: { id: string | { equals?: string; in?: string[] } } }

type SkipTakeArgs = Args & { skip?: number; take?: number }

export const readOne =
  <T>(
    __typename: string,
  ): FieldReadFunction<T, T | Reference, FieldFunctionOptions<Args>> =>
  (existingData, { args, toReference }) => {
    if (existingData || !args) return existingData
    const id =
      'id' in args ? args.id : 'where' in args ? args.where?.id : undefined
    if (typeof id === 'string') {
      return toReference({ __typename, id })
    } else if (id?.equals) {
      return toReference({ __typename, id: id.equals })
    }
  }

export const readMany =
  <T>(
    __typename: string,
  ): FieldReadFunction<
    T[],
    readonly T[] | Reference[],
    FieldFunctionOptions<Args>
  > =>
  (existingData, { args, toReference }) => {
    if (existingData || !args) return existingData
    const id =
      'id' in args ? args.id : 'where' in args ? args.where?.id : undefined
    if (typeof id === 'string') {
      const reference = toReference({ __typename, id })
      if (reference) return [reference]
    } else {
      if (id?.equals) {
        const reference = toReference({ __typename, id: id.equals })
        if (reference) return [reference]
      }
      if (id?.in) {
        return id.in
          .map((id: string) => toReference({ __typename, id }))
          .filter(notNullish)
      }
    }
  }

// https://github.com/apollographql/apollo-client/blob/02a78df36ab26af3dec71fb7b48c00d5836ed2cb/src/utilities/policies/pagination.ts#L24-L55
export const skipTakeMerge =
  <T>(): FieldMergeFunction<T[], T[], FieldFunctionOptions<SkipTakeArgs>> =>
  (existing, incoming, { args }) => {
    const merged = existing ? existing.slice(0) : []

    if (incoming) {
      if (args) {
        // Assume an offset of 0 if args.offset omitted.
        const { skip = 0 } = args
        for (let i = 0; i < incoming.length; ++i) {
          merged[skip + i] = incoming[i]
        }
      } else {
        // It's unusual (probably a mistake) for a paginated field not
        // to receive any arguments, so you might prefer to throw an
        // exception here, instead of recovering by appending incoming
        // onto the existing array.
        return [...merged, ...incoming]
      }
    }

    return merged
  }

export const skipTakePagination = <T>(
  __typename: string,
  keyArgs: KeyArgs = false,
): FieldPolicy<
  T[],
  T[],
  readonly T[] | Reference[],
  FieldFunctionOptions<SkipTakeArgs>
> => {
  return {
    keyArgs,
    read: readMany(__typename),
    merge: skipTakeMerge(),
  }
}
