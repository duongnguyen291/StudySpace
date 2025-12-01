import axios from 'axios'

export async function uploadCsv(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await axios.post('/api/v1/quiz/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

export function formatCsvForDownload(rows: string[][], headers: string[]) {
  const lines = [headers.join(','), ...rows.map(r => r.map(c => (c.includes(',') || c.includes('"') ? `"${c.replace(/"/g,'""')}"` : c)).join(','))]
  return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
}