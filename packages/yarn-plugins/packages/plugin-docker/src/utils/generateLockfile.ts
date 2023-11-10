import { Project, Report } from '@yarnpkg/core'
import { PortablePath, ppath, xfs } from '@yarnpkg/fslib'

export default async function generateLockfile({
  destination,
  project,
  report,
}: {
  destination: PortablePath
  project: Project
  report: Report
}): Promise<void> {
  const filename = 'yarn.lock'
  const dest = ppath.join(destination, filename)

  report.reportInfo(null, filename)
  await xfs.mkdirpPromise(ppath.dirname(dest))
  await xfs.writeFilePromise(dest, project.generateLockfile())
}
