import path from 'path'

export const EVAL_NUTRI_MAX_FILES_DEFAULT = 5
export const EVAL_NUTRI_MAX_FILE_MB_DEFAULT = 10

const resolveStorageRoot = () => {
  const storagePath = process.env.STORAGE_NFS_PATH
  const basePath =
    storagePath && storagePath.trim().length > 0
      ? storagePath
      : path.resolve(process.cwd(), 'storage')

  return path.isAbsolute(basePath) ? basePath : path.resolve(basePath)
}

export const EVAL_NUTRI_STORAGE_ROOT = resolveStorageRoot()
export const EVAL_NUTRI_STORAGE_DIRNAME = path.join(
  'uploads',
  'evaluaciones-nutricionales'
)
export const EVAL_NUTRI_TEMP_DIR = path.join(
  EVAL_NUTRI_STORAGE_ROOT,
  EVAL_NUTRI_STORAGE_DIRNAME,
  'temp'
)

export function getEvalNutriMaxFiles(): number {
  const value = Number(process.env.EVAL_NUTRI_MAX_FILES)
  return Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : EVAL_NUTRI_MAX_FILES_DEFAULT
}

export function getEvalNutriMaxFileSizeMb(): number {
  const value = Number(process.env.EVAL_NUTRI_MAX_FILE_MB)
  return Number.isFinite(value) && value > 0
    ? value
    : EVAL_NUTRI_MAX_FILE_MB_DEFAULT
}

export function getEvalNutriMaxFileSizeBytes(): number {
  return Math.floor(getEvalNutriMaxFileSizeMb() * 1024 * 1024)
}

export function getEvalNutriFinalBaseDir(): string {
  return path.join(EVAL_NUTRI_STORAGE_ROOT, EVAL_NUTRI_STORAGE_DIRNAME)
}
