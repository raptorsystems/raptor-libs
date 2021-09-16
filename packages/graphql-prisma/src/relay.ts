// Reference
// https://gist.github.com/ctrlplusb/17b5a1bd1736b5ba547bb15b3dd5be29

import { UserInputError } from 'apollo-server-errors'
import { ConnectionArguments, ConnectionCursor } from 'graphql-relay'
import { Connection, PrismaPaginationArgs } from './types'

/**
 * Supports the Relay Cursor Connection Specification
 *
 * @see https://facebook.github.io/relay/graphql/connections.htm
 */
export async function relayFindManyCursor<Model extends { id: string }>(
  findMany: (args: PrismaPaginationArgs) => Promise<Model[]>,
  count: Promise<number>,
  args: ConnectionArguments = {} as ConnectionArguments,
): Promise<Connection<Model>> {
  if (args.first != null && args.first < 0) {
    throw new UserInputError('first is less than 0')
  }
  if (args.last != null && args.last < 0) {
    throw new UserInputError('last is less than 0')
  }

  const originalLength =
    args.first != null ? args.first : args.last != null ? args.last : undefined

  // We will fetch an additional node so that we can determine if there is a
  // prev/next page
  const first = args.first != null ? args.first + 1 : undefined
  const last = args.last != null ? args.last + 1 : undefined

  // Execute the underlying findMany operation
  const prismaArgs = relayToPrismaConnectionArgs({ ...args, first, last })
  const nodes = await findMany(prismaArgs)

  // Check if we actually got an additional node. This would indicate we have
  // a prev/next page
  const hasExtraNode = originalLength != null && nodes.length > originalLength

  // Remove the extra node from the results
  if (hasExtraNode) {
    if (first != null) {
      nodes.pop()
    } else if (last != null) {
      nodes.shift()
    }
  }

  // Get the start and end cursors
  const startCursor = nodes.length > 0 ? nodes[0].id : null
  const endCursor = nodes.length > 0 ? nodes[nodes.length - 1].id : null

  // If paginating forward:
  // - For the next page, see if we had an extra node in the result set
  // - For the previous page, see if we are "after" another node (so there has
  //   to be more before this)
  // If paginating backwards:
  // - For the next page, see if we are "before" another node (so there has to be
  //   more after this)
  // - For the previous page, see if we had an extra node in the result set
  const hasNextPage = first != null ? hasExtraNode : args.before != null
  const hasPreviousPage = first != null ? args.after != null : hasExtraNode

  return {
    pageInfo: {
      startCursor,
      endCursor,
      hasNextPage,
      hasPreviousPage,
    },
    nodes,
    edges: nodes.map((node) => ({ cursor: node.id, node })),
    totalCount: await count,
  }
}

// Reference
// https://github.com/graphql-nexus/nexus-plugin-prisma/blob/2c331b7332986ea6f01979b9a25100944f8ec253/src/schema/pagination/relay.ts

function relayToPrismaConnectionArgs(
  args: ConnectionArguments,
): PrismaPaginationArgs {
  const { first, last, before, after } = args

  // If no pagination set, don't touch the args
  if (!first && !last && !before && !after)
    return {
      take: undefined,
      cursor: undefined,
      skip: undefined,
    }

  /**
   * This is currently only possible with js transformation on the result. eg:
   * after: 1, last: 1
   * ({
   *   cursor: { id: $before },
   *   take: Number.MAX_SAFE_INTEGER,
   *   skip: 1
   * }).slice(length - $last, length)
   */
  if (after && last)
    throw new UserInputError(`after and last can't be set simultaneously`)

  /**
   * This is currently only possible with js transformation on the result. eg:
   * before: 4, first: 1
   * ({
   *   cursor: { id: $before },
   *   take: Number.MIN_SAFE_INTEGER,
   *   skip: 1
   * }).slice(0, $first)
   */
  if (before && first)
    throw new UserInputError(`before and first can't be set simultaneously`)

  // Edge-case: simulates a single `before` with a hack
  if (before && !first && !last && !after)
    return {
      cursor: before,
      skip: 1,
      take: Number.MIN_SAFE_INTEGER,
    }

  const take = resolveTake(first, last)
  const cursor = resolveCursor(before, after)
  const skip = resolveSkip(cursor)

  return {
    take,
    cursor,
    skip,
  }
}

function resolveTake(
  first?: number | null,
  last?: number | null,
): number | undefined {
  if (first && last) {
    throw new UserInputError(`first and last can't be set simultaneously`)
  }

  if (first) {
    if (first < 0) throw new UserInputError(`first can't be negative`)
    return first
  }

  if (last) {
    if (last < 0) throw new UserInputError(`last can't be negative`)
    if (last === 0) return 0
    return last * -1
  }

  return undefined
}

function resolveCursor(
  before?: ConnectionCursor | null,
  after?: ConnectionCursor | null,
): ConnectionCursor | undefined {
  if (before && after)
    throw new UserInputError(`before and after can't be set simultaneously`)

  return before ?? after ?? undefined
}

function resolveSkip(cursor?: ConnectionCursor): number | undefined {
  if (cursor) return 1

  return undefined
}
