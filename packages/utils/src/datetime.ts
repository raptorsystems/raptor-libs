export const toISODate = (value: string | Date) => {
  if (typeof value !== 'string') value = value.toISOString()
  return value.substring(0, 10)
}

export const addISOTime = (value: string, time = '00:00:00.000Z') =>
  `${value}T${time}`
