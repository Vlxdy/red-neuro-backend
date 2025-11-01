import path from 'path'

const resolveChatStorageRoot = () => {
  const storagePath = process.env.STORAGE_NFS_PATH
  const basePath =
    storagePath && storagePath.trim().length > 0
      ? storagePath
      : path.resolve(process.cwd(), 'storage')

  return path.isAbsolute(basePath) ? basePath : path.resolve(basePath)
}

export const CHAT_STORAGE_ROOT = resolveChatStorageRoot()
export const CHAT_STORAGE_DIRNAME = path.join('uploads', 'comentarios')
export const CHAT_TEMP_DIR = path.join(
  CHAT_STORAGE_ROOT,
  CHAT_STORAGE_DIRNAME,
  'temp'
)

export const CHAT_MAX_FILES_DEFAULT = 5
export const CHAT_MAX_FILE_MB_DEFAULT = 25

export function getChatMaxFiles(): number {
  const value = Number(process.env.CHAT_MAX_FILES)
  return Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : CHAT_MAX_FILES_DEFAULT
}

export function getChatMaxFileSizeMb(): number {
  const value = Number(process.env.CHAT_MAX_FILE_MB)
  return Number.isFinite(value) && value > 0 ? value : CHAT_MAX_FILE_MB_DEFAULT
}

export function getChatMaxFileSizeBytes(): number {
  return Math.floor(getChatMaxFileSizeMb() * 1024 * 1024)
}

export function getChatFinalBaseDir(): string {
  return path.join(CHAT_STORAGE_ROOT, CHAT_STORAGE_DIRNAME)
}
