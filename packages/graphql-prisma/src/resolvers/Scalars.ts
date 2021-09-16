import { Prisma } from '@prisma/client'
import { isNullish } from '@raptor/utils'
import { GraphQLError } from 'graphql'
import { Kind } from 'graphql/language'
import { scalarType } from 'nexus'

const processDecimal = (value: Prisma.Decimal.Value | null | undefined) => {
  if (isNullish(value) || Number.isNaN(value))
    throw new TypeError(`Value is not a valid number: ${String(value)}`)

  const parsedValue = new Prisma.Decimal(value)

  if (!parsedValue.isFinite())
    throw new TypeError(`Value is not a finite decimal: ${String(value)}`)

  return parsedValue
}

export const DecimalScalarType = scalarType({
  name: 'Decimal',
  description: 'The `Decimal` scalar type to represent currency values',
  asNexusMethod: 'decimal',
  serialize: (value) => processDecimal(value).toNumber(),
  parseValue: processDecimal,
  parseLiteral(ast) {
    if (
      ast.kind !== Kind.FLOAT &&
      ast.kind !== Kind.INT &&
      ast.kind !== Kind.STRING
    )
      throw new GraphQLError(
        `Can only validate numbers and strings as decimal but got a: ${ast.kind}`,
      )

    return processDecimal(ast.value)
  },
})
