import { id } from 'cls-rtracer'

export function getReqID(): string {
  return String(id() || '')
}
