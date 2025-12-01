export type Row = string[]
export type ParsedResult = {
  headers: string[]
  rows: Row[]
  errors?: { line: number; message: string }[]
}