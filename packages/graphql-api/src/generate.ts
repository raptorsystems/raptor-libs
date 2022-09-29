import fs from 'node:fs/promises'
import { GraphQLSchema, printSchema } from 'graphql'

const safeImportPrettier = async () => {
  try {
    const prettier = await import('prettier')
    return prettier.default
  } catch (error) {
    console.warn('Missing prettier dependency. Skipping formatting.')
    return null
  }
}

const prettierFormatSchema = async (content: string, configFile?: string) => {
  const prettier = await safeImportPrettier()
  if (!prettier) return content
  const filePath = await prettier.resolveConfigFile(configFile)
  const options = filePath ? await prettier.resolveConfig(filePath) : undefined
  return prettier.format(content, { ...options, parser: 'graphql' })
}

export const generateFormattedSchema = async ({
  schema,
  path,
  prettierConfig,
}: {
  schema: GraphQLSchema
  path: string
  prettierConfig?: string
}) => {
  const content = printSchema(schema)
  const formatted = await prettierFormatSchema(content, prettierConfig)
  await fs.writeFile(path, formatted)
}
