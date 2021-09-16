import { Report } from '@yarnpkg/core'
import { PortablePath, ppath, toFilename, xfs } from '@yarnpkg/fslib'

export default async function copyAdditional({
  destination,
  dockerFilePath,
  report,
}: {
  destination: PortablePath
  dockerFilePath: PortablePath
  report: Report
}): Promise<void> {
  const path = dockerFilePath
  const dest = ppath.join(destination, toFilename('Dockerfile'))

  report.reportInfo(null, path)
  await xfs.copyPromise(dest, path, {
    overwrite: true,
  })
}
