import { BaseService } from '@/common/base'
import { Injectable } from '@nestjs/common'
import pdfMake from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
const fonts = {
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique',
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
  Symbol: {
    normal: 'Symbol',
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats',
  },
}
@Injectable()
export class PrinterService extends BaseService {
  private printer = new pdfMake(fonts)
  constructor() {
    super()
  }

  crearPDF(contenido: TDocumentDefinitions) {
    return this.printer.createPdfKitDocument(contenido)
  }
}
