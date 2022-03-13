import type { Prisma } from '@prisma/client'
import type * as relay from 'graphql-relay'

export type Decimal = Prisma.Decimal

export type DecimalValue = Prisma.Decimal.Value

// ? nexus fails to find this types
export type QueryMode = Prisma.QueryMode
export type SortOrder = Prisma.SortOrder

export interface PrismaPaginationArgs {
  cursor?: string
  take?: number
  skip?: number
}

export type PageInfo = relay.PageInfo

export type Edge<T> = relay.Edge<T>

export interface Connection<T> extends relay.Connection<T> {
  nodes: T[]
  totalCount: number
}
