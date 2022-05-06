import chalk from 'chalk'
import consola from 'consola'
import type { FastifyInstance } from 'fastify'

export async function runServer(
  server: FastifyInstance,
  port: string | number,
) {
  const isProd = process.env.NODE_ENV === 'production'
  const host = isProd ? '0.0.0.0' : 'localhost'
  try {
    if (!port) port = process.env.PORT || '4000'
    const url = await server.listen({ port: Number(port), host })
    consola.info(chalk.bold(`Listening on: ${url}`))
  } catch (error: any) {
    server.log.error(error)
    process.exit(1)
  }
}

export * from './plugins'
export * from './routes'
