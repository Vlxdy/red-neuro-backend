import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as path from 'path'
import * as fs from 'fs/promises'

@Injectable()
export class FileService {
  private readonly storagePath: string

  constructor(private configService: ConfigService) {
    const configuredPath = this.configService.get<string>('STORAGE_NFS_PATH')
    if (!configuredPath) {
      throw new Error('STORAGE_NFS_PATH no está definido en la configuración')
    }
    this.storagePath = configuredPath
  }

  async getProfilePhotoPath(filename: string): Promise<string | null> {
    const filePath = path.join(
      this.storagePath,
      'uploads',
      'profile-photos',
      filename
    )
    try {
      await fs.access(filePath)
      return filePath
    } catch {
      return null
    }
  }
}
