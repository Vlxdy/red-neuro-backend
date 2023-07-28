import { Injectable } from '@nestjs/common'
import htmlToPdfmake from 'html-to-pdfmake'
import jsdom from 'jsdom'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { DynamicContent, Margins, PageSize } from 'pdfmake/interfaces'

const pdf = pdfMake
pdf.vfs = pdfFonts.pdfMake.vfs

const { JSDOM } = jsdom
const { window } = new JSDOM('')

@Injectable()
export class PdfService {
  static generate(template: string) {
    const html = htmlToPdfmake(template, { window })
    const docDefinition = {
      content: [html],
      ...this.pdfContent(),
      footer: function footer(currentPage, pageCount) {
        return {
          text: `Página ${currentPage.toString()} de ${pageCount}`,
          alignment: currentPage % 2 === 0 ? 'left' : 'right',
          style: 'normalText',
          margin: [40, 10, 40, 10],
        }
      } as DynamicContent,
    }
    return pdf.createPdf(docDefinition)
  }

  /**
   * Metodo que retorna un documento pdf en base64 a partir de html
   * @param template string plantilla html
   * @returns Promise
   */
  static generateBase64(template: string) {
    const pdfDoc = this.generate(template)
    return new Promise((resolve, reject) => {
      pdfDoc.getBase64((data) => {
        if (!data) reject()
        resolve(data)
      })
    })
  }

  /**
   * Metodo que retorna un documento pdf como buffer a partir de html
   * @param template string plantilla html
   * @returns Promise
   */
  static generateBuffer(template: string) {
    const pdfDoc = this.generate(template)
    return new Promise((resolve, reject) => {
      pdfDoc.getBuffer((buffer) => {
        if (!buffer) reject()
        resolve(buffer)
      })
    })
  }

  static generateStream(template: string) {
    const pdfDoc = this.generate(template)
    return pdfDoc.getStream()
  }

  static pdfContent() {
    const pageSize = 'A4' as PageSize
    const pageMargins = [40, 60, 40, 60] as Margins
    return {
      pageSize,
      pageMargins,
    }
  }
}
