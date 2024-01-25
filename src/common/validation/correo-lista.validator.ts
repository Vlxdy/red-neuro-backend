import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator'
import { ValidationMessageEnum } from './i18n/es.enum'
import { Configurations } from '../params'
import dotenv from 'dotenv'

dotenv.config()

export const IS_CORREO_LISTA = 'correoLista'

export const correoLista = (value?: string | null) => {
  const nameEmail = value?.substring(0, value?.lastIndexOf('@'))
  const domainEmail = value?.substring(value?.lastIndexOf('@') + 1)
  const esProd = String(process.env.NODE_ENV) === 'production'
  const correosBloqueados = esProd ? Configurations.BLACK_LIST_EMAILS : []

  return domainEmail && nameEmail
    ? !correosBloqueados.some((domain) => domainEmail === domain)
    : false
}

export const CorreoLista = (
  validationsOptions?: ValidationOptions
): PropertyDecorator =>
  ValidateBy(
    {
      name: 'CORREO_LISTA',
      constraints: [],
      validator: {
        validate: (value) => correoLista(value),
        defaultMessage: buildMessage(
          () => ValidationMessageEnum.CORREO_LISTA,
          validationsOptions
        ),
      },
    },
    validationsOptions
  )
