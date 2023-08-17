import ip from 'ip'

export function getIPAddress(): string {
  return String(ip.address())
}
