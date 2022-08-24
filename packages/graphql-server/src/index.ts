import chalk from 'chalk'
import consola from 'consola'
import type { FastifyInstance, FastifyListenOptions } from 'fastify'

export async function runServer(
  server: FastifyInstance,
  opts: FastifyListenOptions,
) {
  try {
    const url = await server.listen(opts)
    consola.info(chalk.bold(`Listening on: ${url}`))
  } catch (error) {
    server.log.fatal(error)
    process.exit(1)
  }
}

export * from './plugins'
export * from './routes'
