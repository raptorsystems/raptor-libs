import { PortablePath, xfs, ppath, npath } from '@yarnpkg/fslib'
import { Report } from '@yarnpkg/core'

function resolvePath(baseDir: PortablePath, inputPath: string): PortablePath {
  const path = npath.toPortablePath(inputPath)

  if (ppath.isAbsolute(path)) {
    return ppath.relative(baseDir, path)
  }

  return path
}

export default async function copyAdditional({
  destination,
  files,
  buildDir,
  report,
}: {
  destination: PortablePath
  files: string[]
  buildDir: PortablePath
  report: Report
}): Promise<void> {
  const baseDir = ppath.dirname(buildDir)

  for (const file of files) {
    const path = resolvePath(baseDir, file)
    const src = ppath.join(baseDir, path)
    const dest = ppath.join(destination, path)

    report.reportInfo(null, path)
    await xfs.copyPromise(dest, src)
  }
}
