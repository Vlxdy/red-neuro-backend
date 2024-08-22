import { networkInterfaces } from 'os'
import { Address4, Address6, AddressError } from 'ip-address'

export function getIPAddress(): string {
  const nets = networkInterfaces()

  for (const netName of Object.keys(nets)) {
    const netInfo = nets[netName]
    if (!netInfo) continue

    for (const net of netInfo) {
      if (net.internal) return ''
      try {
        if (net.family === 'IPv4' && Address4.isValid(net.address)) {
          return new Address4(net.address).correctForm()
        }
        if (net.family === 'IPv6' && Address6.isValid(net.address)) {
          return new Address6(net.address).correctForm()
        }
      } catch (error) {
        if (error instanceof AddressError) {
          throw new Error(error.parseMessage)
        }
        throw new Error('No se pudo obtener la dirección IP')
      }
    }
  }

  throw new Error('No se encontró una dirección IP externa válida')
}
