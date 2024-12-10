import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common'
import { Response } from 'express'
import { FileService } from './file.service'

@Controller('uploads')
export class FileController {
  constructor(private fileService: FileService) {}

  @Get('profile-photos/:filename')
  async serveProfilePhoto(
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const filePath = await this.fileService.getProfilePhotoPath(filename)
    if (!filePath) {
      throw new NotFoundException('Imagen no encontrada')
    }
    res.sendFile(filePath)
  }
}
