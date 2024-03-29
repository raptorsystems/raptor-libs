import { BaseCommand } from '@yarnpkg/cli'
import {
  Cache,
  Configuration,
  Project,
  StreamReport,
  structUtils,
} from '@yarnpkg/core'
import { npath, ppath, xfs } from '@yarnpkg/fslib'
import { patchUtils } from '@yarnpkg/plugin-patch'
import { Command, Option } from 'clipanion'
import copyAdditional from '../utils/copyAdditional.ts'
import copyCacheMarkedFiles from '../utils/copyCacheMarkedFiles.ts'
import copyManifests from '../utils/copyManifests.ts'
import copyPlugins from '../utils/copyPlugins.ts'
import copyProtocolFiles from '../utils/copyProtocolFiles.ts'
import copyRcFile from '../utils/copyRcFile.ts'
import copyYarnRelease from '../utils/copyYarnRelease.ts'
import { parseSpec } from '../utils/execUtils.ts'
import generateLockfile from '../utils/generateLockfile.ts'
import getRequiredWorkspaces from '../utils/getRequiredWorkspaces.ts'
import packWorkspace from '../utils/packWorkspace.ts'

export default class DockerPackCommand extends BaseCommand {
  public workspaceName: string = Option.String()

  public buildDir: string = Option.String('-d,--dir', 'build')

  public copyPackFiles?: string[] = Option.Array('-cp,--copy-pack')

  public copyManifestFiles?: string[] = Option.Array('-cm,--copy-manifest')

  public production?: boolean = Option.Boolean('-p,--production')

  public static usage = Command.Usage({
    category: 'Docker-related commands',
    description: 'Pack a workspace for Docker',
    details: `
      This command will pack a build dir which only contains required dependencies for the specified workspace.

      You can copy additional files or folders using the "--copy-pack/manifest" option. This is useful for secret keys or configuration files. The files will be copied to either the "manifests" or "packs" folders. The path can be either a path relative to the build dir or an absolute path.
    `,
    examples: [
      ['Pack a workspace for Docker', 'yarn docker pack @foo/bar'],
      [
        'Copy additional files',
        'yarn docker pack --copy-pack secret.key --copy-manifest config.json @foo/bar',
      ],
    ],
  })

  static paths = [['docker', 'pack']]

  public async execute(): Promise<number> {
    const configuration = await Configuration.find(
      this.context.cwd,
      this.context.plugins,
    )
    const { project } = await Project.find(configuration, this.context.cwd)

    const workspace = project.getWorkspaceByIdent(
      structUtils.parseIdent(this.workspaceName),
    )

    const requiredWorkspaces = getRequiredWorkspaces({
      project,
      workspaces: [workspace],
      production: this.production,
    })

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

        await report.startTimerPromise('Fetch Step', async () => {
          await project.fetchEverything({ report, cache })
        })

        const buildDir = ppath.join(
          this.context.cwd,
          npath.toPortablePath(this.buildDir),
        )

        await report.startTimerPromise('Remove previous build', async () => {
          await xfs.removePromise(buildDir, { recursive: true })
        })

        const manifestDir = ppath.join(buildDir, 'manifests')
        const packDir = ppath.join(buildDir, 'packs')

        await report.startTimerPromise('Copy files', async () => {
          await copyRcFile({
            destination: manifestDir,
            project,
            report,
          })

          await copyPlugins({
            destination: manifestDir,
            project,
            report,
          })

          await copyYarnRelease({
            destination: manifestDir,
            project,
            report,
          })

          await copyManifests({
            destination: manifestDir,
            workspaces: project.workspaces,
            report,
          })

          await copyProtocolFiles({
            destination: manifestDir,
            report,
            project,
            parseDescriptor: (descriptor) => {
              if (descriptor.range.startsWith('exec:')) {
                const parsed = parseSpec(descriptor.range)
                if (!parsed?.parentLocator) return
                return {
                  parentLocator: parsed.parentLocator,
                  paths: [parsed.path],
                }
              } else if (descriptor.range.startsWith('patch:')) {
                const { parentLocator, patchPaths: paths } =
                  patchUtils.parseDescriptor(descriptor)
                if (!parentLocator) return
                return { parentLocator, paths }
              }
            },
          })

          await copyCacheMarkedFiles({
            destination: manifestDir,
            project,
            cache,
            report,
          })

          await generateLockfile({
            destination: manifestDir,
            project,
            report,
          })

          if (this.copyManifestFiles?.length) {
            await copyAdditional({
              destination: manifestDir,
              files: this.copyManifestFiles,
              buildDir,
              report,
            })
          }
        })

        for (const ws of requiredWorkspaces) {
          const name = ws.manifest.name
            ? structUtils.stringifyIdent(ws.manifest.name)
            : ''

          await report.startTimerPromise(`Pack workspace ${name}`, async () => {
            await packWorkspace({
              workspace: ws,
              report,
              destination: packDir,
              manifestDir,
            })
          })
        }

        if (this.copyPackFiles?.length) {
          await copyAdditional({
            destination: packDir,
            files: this.copyPackFiles,
            buildDir,
            report,
          })
        }
      },
    )

    return report.exitCode()
  }
}
