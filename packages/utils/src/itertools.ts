// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_chunk
export const chunk = <T>(input: T[], size: number): T[][] =>
  input.reduce<T[][]>((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...(arr.slice(-1)[0] ?? []), item]]
  }, [])

// https://stackoverflow.com/a/10284006
export const zip = <T>(rows: T[][]): T[][] =>
  rows[0]?.map((_, c) => rows.map((row) => row[c]!)) ?? []
