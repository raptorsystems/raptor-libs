import { Prisma } from '@prisma/client'

type Decimal = Prisma.Decimal.Value

export const D = (value: Prisma.Decimal.Value): Decimal =>
  new Prisma.Decimal(value)

export const max = (...n: Prisma.Decimal.Value[]) => Prisma.Decimal.max(...n)

export const min = (...n: Prisma.Decimal.Value[]) => Prisma.Decimal.min(...n)

export const zero = D(0)

export const isDecimal = (value: unknown): value is Prisma.Decimal =>
  Prisma.Decimal.isDecimal(value)

export const truthyDecimal = (
  value: Decimal | null | undefined,
): value is Decimal =>
  isDecimal(value) ? value.isFinite() && !value.isZero() : Boolean(value)
