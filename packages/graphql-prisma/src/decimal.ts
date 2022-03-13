import prisma from '@prisma/client'

export const D = (value: prisma.Prisma.Decimal.Value): prisma.Prisma.Decimal =>
  new prisma.Prisma.Decimal(value)

export const max = (...n: prisma.Prisma.Decimal.Value[]) =>
  prisma.Prisma.Decimal.max(...n)

export const min = (...n: prisma.Prisma.Decimal.Value[]) =>
  prisma.Prisma.Decimal.min(...n)

export const zero = D(0)

export const isDecimal = (value: unknown): value is prisma.Prisma.Decimal =>
  prisma.Prisma.Decimal.isDecimal(value)

export const truthyDecimal = (
  value: prisma.Prisma.Decimal.Value | null | undefined,
): value is prisma.Prisma.Decimal =>
  isDecimal(value) ? value.isFinite() && !value.isZero() : Boolean(value)
