export class TemplateEmailService {
  static armarPlantillaCredencialesAcceso(
    usuario: string,
    contrasena: string,
    tipo: 'registro' | 'restablecimiento',
    contacto: {
      empresa: string
      celular: string
      correo: string
    }
  ) {
    const titulo =
      tipo === 'registro'
        ? 'Tu cuenta fue creada correctamente'
        : 'Tu contraseña fue restablecida correctamente'

    const descripcion =
      tipo === 'registro'
        ? `Te damos la bienvenida a ${contacto.empresa}. Hemos creado tus credenciales de acceso para la aplicación.`
        : `Se realizó el restablecimiento de tu contraseña en ${contacto.empresa}. Te compartimos tus credenciales actualizadas para que puedas ingresar nuevamente.`

    return `<!DOCTYPE html>
<html lang='es'>
  <head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Credenciales de acceso</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #eef2f7;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
      }
      .wrapper {
        width: 100%;
        padding: 28px 14px;
        box-sizing: border-box;
      }
      .container {
        width: 100%;
        max-width: 680px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #dbe3ee;
        border-radius: 14px;
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #0f4c81, #1b6aa8);
        padding: 22px 24px;
        text-align: center;
      }
      .logo {
        max-width: 190px;
        display: block;
        margin: 0 auto;
      }
      .content {
        padding: 26px 24px 22px;
      }
      .title {
        margin: 0 0 10px;
        font-size: 24px;
        color: #0f172a;
      }
      .paragraph {
        margin: 0 0 14px;
        font-size: 15px;
        line-height: 1.65;
        color: #334155;
      }
      .credentials {
        background: #f8fbff;
        border: 1px solid #d9e7f7;
        border-radius: 10px;
        padding: 14px 16px;
        margin: 18px 0;
      }
      .credentials p {
        margin: 0;
        font-size: 15px;
        line-height: 1.75;
        color: #0f172a;
      }
      .support {
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid #e5eaf1;
      }
      .support-title {
        margin: 0 0 8px;
        font-size: 15px;
        color: #0f172a;
      }
      .footer {
        background: #f8fafc;
        color: #64748b;
        font-size: 12px;
        text-align: center;
        padding: 14px;
      }
    </style>
  </head>
  <body>
    <div class='wrapper'>
      <div class='container'>
        <div class='header'>
          <img src='cid:logo-neuroax' alt='Logo ${contacto.empresa}' class='logo'/>
        </div>

        <div class='content'>
          <h2 class='title'>${titulo}</h2>
          <p class='paragraph'>${descripcion}</p>

          <div class='credentials'>
            <p><b>Usuario:</b> ${usuario}</p>
            <p><b>Contraseña temporal:</b> ${contrasena}</p>
          </div>

          <p class='paragraph'>Si tienes alguna dificultad para ingresar o instalar la aplicación, nuestro equipo puede ayudarte.</p>
          <p class='paragraph'>Por seguridad, te recomendamos cambiar tu contraseña al iniciar sesión.</p>

          <div class='support'>
            <p class='support-title'><b>Datos de contacto</b></p>
            <p class='paragraph'>Celular: ${contacto.celular}</p>
            <p class='paragraph'>Correo: ${contacto.correo}</p>
          </div>
        </div>

        <div class='footer'>
          ${contacto.empresa} · Mensaje automático de notificación
        </div>
      </div>
    </div>
  </body>
</html>`
  }

  static armarPlantillaBloqueoCuenta(url: string) {
    return `
      <!DOCTYPE html>
      <html lang='es'>
        <head>
          <meta charset='UTF-8'>
          <style>
            .container {
              width: 100%;
              max-width: 640px;
              margin-top: 10vh;
            }
          </style>
          <title>Desbloquear cuenta</title>
        </head>
        <body>
          <div class='container'>
            Tu cuenta ha sido bloqueada temporalmente por muchos intentos fallidos de inicio de sesión.<br/>
            Para desbloquear tu cuenta haz clic en la siguiente url: <a href='${url}'>${url}</a><br/>
          </div>
        </body>
      </html>
    `
  }

  static armarPlantillaRecuperacionCuenta(url: string) {
    return `
      <!DOCTYPE html>
      <html lang='es'>
        <head>
          <meta charset='UTF-8'>
          <style>
            .container {
              width: 100%;
              max-width: 640px;
              margin-top: 10vh;
            }
          </style>
          <title>Recupera de cuenta</title>
        </head>
        <body>
          <div class='container'>

            Para recuperar tu cuenta haz clic en la siguiente url: <a href='${url}'>${url}</a><br/>
          </div>
        </body>
      </html>
    `
  }

  static armarPlantillaActivacionCuentaManual(url: string) {
    return `
      <!DOCTYPE html>
      <html lang='es'>
        <head>
          <meta charset='UTF-8'>
          <style>
            .container {
              width: 100%;
              max-width: 640px;
              margin-top: 10vh;
            }
          </style>
          <title>Activación de cuenta</title>
        </head>
        <body>
          <div class='container'>

            Para activar tu cuenta haz clic en la siguiente url: <a href='${url}'>${url}</a><br/>
          </div>
        </body>
      </html>
    `
  }
}
