import * as prisma from '@prisma/client'
import * as relay from 'graphql-relay'

export type Decimal = prisma.Prisma.Decimal

export type DecimalValue = prisma.Prisma.Decimal.Value

// ? nexus fails to find this types
export type QueryMode = prisma.Prisma.QueryMode
export type SortOrder = prisma.Prisma.SortOrder

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
