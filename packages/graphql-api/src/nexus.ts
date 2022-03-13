import findConfig from 'find-config'
import merge from 'lodash/merge'
import { makeSchema } from 'nexus'
import * as path from 'path'

type SchemaConfig = Parameters<typeof makeSchema>[0]
type NexusGraphQLSchema = ReturnType<typeof makeSchema>

export const makeNexusSchema = (
  {
    outputDir,
    contextModule,
    typesModule,
    mapping,
  }: {
    outputDir: string
    contextModule: string
    typesModule: string
    mapping: Record<string, string>
  },
  config: SchemaConfig,
): NexusGraphQLSchema =>
  makeSchema(
    merge<Omit<SchemaConfig, 'types'>, SchemaConfig>(
      {
        outputs: {
          schema: path.join(outputDir, 'schema.graphql'),
          typegen: path.join(outputDir, 'nexusTypes.ts'),
        },
        prettierConfig: findConfig('.prettierrc.cjs') ?? undefined,
        nonNullDefaults: {
          input: false,
          output: true,
        },
        contextType: {
          module: contextModule,
          export: 'Context',
        },
        sourceTypes: {
          mapping,
          modules: [
            {
              module: '.prisma/client',
              alias: 'prisma',
            },
            {
              module: typesModule,
              alias: 'types',
            },
            {
              module: '@raptor/graphql-api/src/types',
              alias: '_api',
            },
            {
              module: '@raptor/graphql-prisma/src/types',
              alias: '_prisma',
            },
          ],
        },
      },
      config,
    ),
  )
