import axios from 'axios'

const apiNutriologo = axios.create({
  baseURL: 'http://localhost:4500/api',
})
export async function loginYConfigurarTokenNutriologo(
  usuario: string,
  contrasenaPlano: string
) {
  const contrasena = Buffer.from(contrasenaPlano).toString('base64') // codificar en base64

  try {
    const res = await apiNutriologo.post('/auth', {
      usuario,
      contrasena,
    })

    const token = res.data?.datos?.access_token
    if (!token) {
      throw new Error('No se recibió access_token en la respuesta.')
    }
    console.log(
      `   ✅ Autenticación exitosa para el usuario NUTRICIONISTA: ${usuario}`
    )
    console.log('🔐 Token JWT configurado')
    apiNutriologo.defaults.headers.common['Authorization'] = `Bearer ${token}`
    // return token
  } catch (err) {
    console.error('❌ Error al autenticar:', err.response?.data || err.message)
    throw err
  }
}
export default apiNutriologo
