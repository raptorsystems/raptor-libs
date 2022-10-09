import { BaseCommand } from '@yarnpkg/cli'
import { Cache, Configuration, Project, StreamReport } from '@yarnpkg/core'
import { Command } from 'clipanion'

export default class ResolveCommand extends BaseCommand {
  public static usage = Command.Usage({
    category: 'Resolve dependencies command',
    description: 'Resolves all workspace dependencies',
    details: `
      This command will resolve all dependencies for the specified workspace.
    `,
    examples: [['Resolve workspace dependencies', 'yarn resolve @foo/bar']],
  })

  static paths = [['resolve']]

  public async execute(): Promise<number> {
    const configuration = await Configuration.find(
      this.context.cwd,
      this.context.plugins,
    )
    const { project } = await Project.find(configuration, this.context.cwd)

    const cache = await Cache.find(configuration)

    const report = await StreamReport.start(
      {
        configuration,
        stdout: this.context.stdout,
        includeLogs: !this.context.quiet,
      },
      async (report) => {
        await report.startTimerPromise('Resolution Step', async () => {
          await project.resolveEverything({ report, cache })
        })
      },
    )

    return report.exitCode()
  }
}
