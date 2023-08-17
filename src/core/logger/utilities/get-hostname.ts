import os from 'os'

const HOSTNAME = os.hostname()

export function getHostname(): string {
  return HOSTNAME
}
