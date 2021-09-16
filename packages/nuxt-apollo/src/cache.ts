import type { CacheResolver, StoreObject } from 'apollo-cache-inmemory'

type Args = {
  id?: string
  where?: { id: string | { equals?: string; in?: string[] } }
}

type Context = { getCacheKey: (obj: StoreObject) => unknown }

export const cacheResolveOne =
  (__typename: string): CacheResolver =>
  (_root, args: Args, { getCacheKey }: Context) => {
    const id = args?.id ?? args?.where?.id
    if (id) return getCacheKey({ __typename, id })
  }

export const cacheResolveMany =
  (__typename: string): CacheResolver =>
  (_root, args: Args, { getCacheKey }: Context) => {
    const id = args?.id ?? args?.where?.id
    if (typeof id !== 'string') {
      if (id?.equals) return getCacheKey({ __typename, id: id.equals })
      if (id?.in)
        return id.in.map((id: string) => getCacheKey({ __typename, id }))
    }
  }
