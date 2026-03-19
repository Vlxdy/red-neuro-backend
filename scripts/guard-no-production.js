const env = (process.env.NODE_ENV || '').trim().toLowerCase()
const allowDestructiveSetup =
  (process.env.ALLOW_DESTRUCTIVE_SETUP || '').trim().toLowerCase() === 'true'

if (env === 'production') {
  console.error('El comando "setup" está bloqueado en producción.')
  console.error(
    '   Razón: ejecuta acciones destructivas como migrations:clean y schema:drop.'
  )
  process.exit(1)
}

if (!allowDestructiveSetup) {
  console.error('El comando "setup" requiere confirmación explícita.')
  console.error('---- Usa: ALLOW_DESTRUCTIVE_SETUP=true npm run setup')
  process.exit(1)
}

console.log(
  `✅ Guard OK. NODE_ENV=${env || 'undefined'} | ALLOW_DESTRUCTIVE_SETUP=true`
)
