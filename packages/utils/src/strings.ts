export const capitalize = (string: string) =>
  string.toLowerCase().replace(/(?:^|\s|-)\S/g, (x) => x.toUpperCase())
