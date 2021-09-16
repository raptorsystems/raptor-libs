import {
  ByteResolver,
  DateResolver,
  DateTimeResolver,
  JSONResolver,
} from 'graphql-scalars'
import { scalarType } from 'nexus'

export const ByteScalarType = scalarType({
  ...ByteResolver,
  asNexusMethod: 'byte',
})

export const DateScalarType = scalarType({
  ...DateResolver,
  asNexusMethod: 'date',
})

export const DateTimeScalarType = scalarType({
  ...DateTimeResolver,
  asNexusMethod: 'dateTime',
})

export const JSONScalarType = scalarType({
  ...JSONResolver,
  name: 'Json',
  asNexusMethod: 'json',
})
