/**
 * Export Note utilities
 * Export notes to DOCX, PDF, and other formats
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { sanitizeHtml } from './sanitizeHtml'

export interface ExportNoteData {
  title: string
  content: string // HTML content from React-Quill
  tags?: string[]
  createdAt?: string
}

/**
 * Convert HTML to plain text (strip HTML tags)
 */
const htmlToText = (html: string): string => {
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]*>/g, '')
  }
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

/**
 * Convert HTML to simple paragraphs for DOCX
 * Simplified version that extracts text and basic formatting
 */
const htmlToDocxParagraphs = (html: string): Paragraph[] => {
  const paragraphs: Paragraph[] = []
  
  if (typeof window === 'undefined') {
    // Server-side: simple text extraction
    const text = htmlToText(html)
    if (text.trim()) {
      paragraphs.push(
        new Paragraph({
          text: text,
          spacing: { after: 200 },
        })
      )
    }
    return paragraphs
  }

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = sanitizeHtml(html)

  // Helper to create text runs with formatting
  const createTextRuns = (element: HTMLElement): TextRun[] => {
    const runs: TextRun[] = []
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          runs.push(new TextRun({ text: text + ' ' }))
        }
        return
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tagName = el.tagName.toLowerCase()
        const text = el.textContent?.trim()

        if (text) {
          switch (tagName) {
            case 'strong':
            case 'b':
              runs.push(new TextRun({ text: text + ' ', bold: true }))
              break
            case 'em':
            case 'i':
              runs.push(new TextRun({ text: text + ' ', italics: true }))
              break
            case 'u':
              runs.push(new TextRun({ text: text + ' ', underline: {} }))
              break
            default:
              runs.push(new TextRun({ text: text + ' ' }))
          }
        }

        // Process children
        Array.from(el.childNodes).forEach(processNode)
      }
    }

    Array.from(element.childNodes).forEach(processNode)
    return runs
  }

  // Process each block element
  const processElement = (element: HTMLElement) => {
    const tagName = element.tagName.toLowerCase()

    switch (tagName) {
      case 'h1':
        paragraphs.push(
          new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          })
        )
        break

      case 'h2':
        paragraphs.push(
          new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          })
        )
        break

      case 'h3':
        paragraphs.push(
          new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200 },
          })
        )
        break

      case 'h4':
      case 'h5':
      case 'h6':
        paragraphs.push(
          new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_4,
            spacing: { after: 200 },
          })
        )
        break

      case 'p':
        const pRuns = createTextRuns(element)
        if (pRuns.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: pRuns,
              spacing: { after: 200 },
            })
          )
        } else {
          const text = element.textContent?.trim()
          if (text) {
            paragraphs.push(
              new Paragraph({
                text: text,
                spacing: { after: 200 },
              })
            )
          }
        }
        break

      case 'ul':
      case 'ol':
        const items = element.querySelectorAll('li')
        items.forEach((item) => {
          paragraphs.push(
            new Paragraph({
              text: `• ${item.textContent || ''}`,
              spacing: { after: 100 },
            })
          )
        })
        break

      case 'blockquote':
        paragraphs.push(
          new Paragraph({
            text: element.textContent || '',
            spacing: { before: 200, after: 200 },
            indent: { left: 400 },
          })
        )
        break

      default:
        // For other elements, extract text
        const text = element.textContent?.trim()
        if (text && !element.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol')) {
          const runs = createTextRuns(element)
          if (runs.length > 0) {
            paragraphs.push(
              new Paragraph({
                children: runs,
                spacing: { after: 200 },
              })
            )
          } else {
            paragraphs.push(
              new Paragraph({
                text: text,
                spacing: { after: 200 },
              })
            )
          }
        }
    }
  }

  // Process all direct children
  Array.from(tempDiv.children).forEach((child) => {
    processElement(child as HTMLElement)
  })

  // If no paragraphs were created, add the text content
  if (paragraphs.length === 0) {
    const text = htmlToText(html)
    if (text.trim()) {
      paragraphs.push(
        new Paragraph({
          text: text,
          spacing: { after: 200 },
        })
      )
    }
  }

  return paragraphs
}

/**
 * Export note to DOCX format
 */
export const exportToDocx = async (data: ExportNoteData): Promise<void> => {
  const { title, content, tags, createdAt } = data

  // Title paragraph
  const titleParagraph = new Paragraph({
    text: title || 'Untitled Note',
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  })

  // Metadata paragraph
  const metadataParagraphs: Paragraph[] = []
  if (createdAt) {
    metadataParagraphs.push(
      new Paragraph({
        text: `Created: ${new Date(createdAt).toLocaleString('vi-VN')}`,
        spacing: { after: 100 },
      })
    )
  }
  if (tags && tags.length > 0) {
    metadataParagraphs.push(
      new Paragraph({
        text: `Tags: ${tags.join(', ')}`,
        spacing: { after: 400 },
      })
    )
  }

  // Content paragraphs
  const contentParagraphs = htmlToDocxParagraphs(content)

  // Create document
  const doc = new Document({
    sections: [
      {
        children: [titleParagraph, ...metadataParagraphs, ...contentParagraphs],
      },
    ],
  })

  // Generate and download
  const blob = await Packer.toBlob(doc)
  const fileName = `${title || 'note'}_${Date.now()}.docx`
  saveAs(blob, fileName)
}

/**
 * Export note to PDF format
 */
export const exportToPdf = async (data: ExportNoteData): Promise<void> => {
  const { title, content, tags, createdAt } = data

  // Create a temporary container for rendering
  if (typeof window === 'undefined') {
    throw new Error('PDF export requires browser environment')
  }

  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '210mm' // A4 width
  container.style.padding = '20mm'
  container.style.backgroundColor = '#ffffff'
  container.style.color = '#000000'
  container.style.fontFamily = 'Arial, sans-serif'
  container.style.fontSize = '12px'
  container.style.lineHeight = '1.6'

  // Build HTML content
  let htmlContent = `
    <div style="margin-bottom: 20px;">
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 10px; color: #000;">
        ${title || 'Untitled Note'}
      </h1>
    </div>
  `

  if (createdAt || (tags && tags.length > 0)) {
    htmlContent += '<div style="margin-bottom: 20px; color: #666; font-size: 11px;">'
    if (createdAt) {
      htmlContent += `<p style="margin: 5px 0;">Created: ${new Date(createdAt).toLocaleString('vi-VN')}</p>`
    }
    if (tags && tags.length > 0) {
      htmlContent += `<p style="margin: 5px 0;">Tags: ${tags.join(', ')}</p>`
    }
    htmlContent += '</div>'
  }

  htmlContent += `<div style="color: #000;">${sanitizeHtml(content)}</div>`

  container.innerHTML = htmlContent
  document.body.appendChild(container)

  try {
    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download
    const fileName = `${title || 'note'}_${Date.now()}.pdf`
    pdf.save(fileName)
  } finally {
    // Cleanup
    document.body.removeChild(container)
  }
}

/**
 * Export note to TXT format (plain text)
 */
export const exportToTxt = (data: ExportNoteData): void => {
  const { title, content, tags, createdAt } = data

  let textContent = `${title || 'Untitled Note'}\n`
  textContent += '='.repeat(50) + '\n\n'

  if (createdAt) {
    textContent += `Created: ${new Date(createdAt).toLocaleString('vi-VN')}\n`
  }
  if (tags && tags.length > 0) {
    textContent += `Tags: ${tags.join(', ')}\n`
  }
  textContent += '\n'

  textContent += htmlToText(content)

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
  const fileName = `${title || 'note'}_${Date.now()}.txt`
  saveAs(blob, fileName)
}

/**
 * Export note to HTML format
 */
export const exportToHtml = (data: ExportNoteData): void => {
  const { title, content, tags, createdAt } = data

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Untitled Note'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      text-align: center;
      color: #000;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    .metadata {
      color: #666;
      font-size: 12px;
      margin-bottom: 20px;
    }
    .content {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>${title || 'Untitled Note'}</h1>
  <div class="metadata">
    ${createdAt ? `<p>Created: ${new Date(createdAt).toLocaleString('vi-VN')}</p>` : ''}
    ${tags && tags.length > 0 ? `<p>Tags: ${tags.join(', ')}</p>` : ''}
  </div>
  <div class="content">
    ${sanitizeHtml(content)}
  </div>
</body>
</html>
  `.trim()

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
  const fileName = `${title || 'note'}_${Date.now()}.html`
  saveAs(blob, fileName)
}

