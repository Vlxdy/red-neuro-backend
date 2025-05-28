import axios from 'axios'

const apiAdmin = axios.create({
  baseURL: 'http://localhost:4500/api',
})
export async function loginYConfigurarToken(
  usuario: string,
  contrasenaPlano: string
) {
  const contrasena = Buffer.from(contrasenaPlano).toString('base64') // codificar en base64

  try {
    const res = await apiAdmin.post('/auth', {
      usuario,
      contrasena,
    })

    const token = res.data?.datos?.access_token
    if (!token) {
      throw new Error('No se recibió access_token en la respuesta.')
    }
    apiAdmin.defaults.headers.common['Authorization'] = `Bearer ${token}`
    console.log('🔐 Token JWT configurado')
    // return token
  } catch (err) {
    console.error('❌ Error al autenticar:', err.response?.data || err.message)
    throw err
  }
}
export default apiAdmin
