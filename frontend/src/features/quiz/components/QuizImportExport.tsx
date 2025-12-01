'use client'
import React, { useState } from 'react'

type Row = string[]

function parseCSVSimple(text: string): string[][] {
    const rows: string[][] = []
    const lines = text.split(/\r?\n/)
    for (const line of lines) {
        if (line === '') { rows.push([]); continue }
        let cur = ''
        let inQuotes = false
        const row: string[] = []
        for (let i = 0; i < line.length; i++) {
            const ch = line[i]
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
                else { inQuotes = !inQuotes }
            } else if (ch === ',' && !inQuotes) {
                row.push(cur.trim()); cur = ''
            } else {
                cur += ch
            }
        }
        row.push(cur.trim())
        rows.push(row)
    }
    return rows
}

export default function QuizImportExport(): JSX.Element {
    const [headers, setHeaders] = useState<string[] | null>(null)
    const [rows, setRows] = useState<Row[]>([])
    const [errors, setErrors] = useState<{ line: number; message: string }[]>([])
    const previewLimit = 10

    function handleText(text: string) {
        const parsed = parseCSVSimple(text)
        if (parsed.length === 0) {
            setHeaders(null); setRows([]); setErrors([{ line: 0, message: 'Empty file' }]); return
        }
        const hdr = parsed[0]
        const newRows: Row[] = []
        const newErrors: { line: number; message: string }[] = []
        if (hdr.length === 0 || hdr.every(h => h === '')) newErrors.push({ line: 1, message: 'Header row is empty or malformed' })
        for (let i = 1; i < parsed.length; i++) {
            const r = parsed[i]
            if (r.length === 1 && r[0] === '') continue
            if (r.length !== hdr.length) newErrors.push({ line: i + 1, message: `Expected ${hdr.length} columns but got ${r.length}` })
            newRows.push(r)
        }
        setHeaders(hdr); setRows(newRows); setErrors(newErrors)
    }

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]; if (!file) return
        const reader = new FileReader()
        reader.onload = () => handleText(String(reader.result || ''))
        reader.readAsText(file, 'utf-8')
    }

    function downloadCSV(filename = 'quiz-export.csv') {
        const hdr = headers ?? ['question', 'option1', 'option2', 'option3', 'answer']
        const validRows = rows.filter(r => r.length === hdr.length)
        const lines = [hdr.join(',')]
        for (const r of validRows) {
            lines.push(r.map(cell => (cell.includes(',') || cell.includes('"') ? `"${cell.replace(/"/g, '""')}"` : cell)).join(','))
        }
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob); const a = document.createElement('a')
        a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
    }

    function downloadTemplate() {
        const template = ['question', 'option1', 'option2', 'option3', 'answer'].join(',')
        const blob = new Blob([template], { type: 'text/csv' })
        const url = URL.createObjectURL(blob); const a = document.createElement('a')
        a.href = url; a.download = 'quiz-template.csv'; a.click(); URL.revokeObjectURL(url)
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Quiz Import / Export (.csv)</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV</label>
                <input type="file" accept=".csv,text/csv" onChange={handleFile} className="block" />
                <p className="text-sm text-gray-500 mt-2">Expect header row. Columns must be consistent across rows.</p>
            </div>

            <div className="flex gap-2 mb-6">
                <button onClick={downloadTemplate} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Download Template</button>
                <button onClick={() => downloadCSV()} disabled={!headers || rows.length === 0} className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50">Export Valid Rows</button>
            </div>

            <div className="mb-6">
                <h3 className="font-medium mb-2">Validation</h3>
                {errors.length === 0 ? <p className="text-sm text-green-700">No validation errors detected.</p> :
                    <ul className="list-disc pl-5 text-sm text-red-700">{errors.map((err, i) => <li key={i}>Line {err.line}: {err.message}</li>)}</ul>}
            </div>

            <div>
                <h3 className="font-medium mb-2">Preview (first {previewLimit} rows)</h3>
                {!headers ? <p className="text-sm text-gray-500">No file loaded yet.</p> :
                    <div className="overflow-auto border rounded">
                        <table className="min-w-full divide-y">
                            <thead className="bg-gray-50"><tr>{headers.map((h, idx) => <th key={idx} className="px-3 py-2 text-left text-sm font-medium text-gray-600">{h || `[column ${idx + 1}]`}</th>)}</tr></thead>
                            <tbody>
                                {rows.slice(0,previewLimit).map((r,ri)=>(
                                    <tr key={ri} className={(r.length !== (headers?.length ?? 0)) ? 'bg-yellow-50' : ''}>
                                        {headers.map((_,ci)=><td key={ci} className="px-3 py-2 text-sm text-gray-700">{r[ci] ?? ''}</td>)}
                                    </tr>
                                ))}
                                {rows.length === 0 && (<tr><td colSpan={Math.max(1, headers?.length ?? 1)} className="px-3 py-4 text-sm text-gray-500">No rows</td></tr>)}
                            </tbody>
                        </table>
                    </div>}
            </div>
        </div>
    )
}
