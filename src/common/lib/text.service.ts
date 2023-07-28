import { Injectable } from '@nestjs/common'
import { compare, hash } from 'bcrypt'
import { customAlphabet, nanoid } from 'nanoid'
import { v4, v5 } from 'uuid'
import zxcvbn from 'zxcvbn-typescript'
import { Configurations } from '../params'

@Injectable()
export class TextService {
  /**
   * Metodo para encriptar un password
   * @param password contraeña
   */
  static async encrypt(password: string) {
    return await hash(password, Configurations.SALT_ROUNDS)
  }

  static async compare(
    passwordInPlainText: string | Buffer,
    hashedPassword: string
  ) {
    return await compare(passwordInPlainText, hashedPassword)
  }

  /**
   * Metodo para convertir un texto a formato uuid
   * @param text Texto
   * @param namespace Uuid base
   */
  static textToUuid(
    text: string,
    namespace = 'bb5d0ffa-9a4c-4d7c-8fc2-0a7d2220ba45'
  ): string {
    return v5(text, namespace)
  }

  static generateUuid(): string {
    return v4()
  }

  /**
   * Metodo para generar un texto aleatorio corto de acuerdo a un alfabeto
   * @returns string
   */
  static generateShortRandomText(length = 8): string {
    const nanoid = customAlphabet(
      '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      length
    )
    return nanoid()
  }

  /**
   * Metodo para generar un texto aleatorio corto
   * @returns string
   */
  static generateNanoId(): string {
    return nanoid()
  }

  static validateLevelPassword(password: string) {
    const result = zxcvbn(password)
    return result.score >= Configurations.SCORE_PASSWORD
  }

  static decodeBase64 = (base64: string) => {
    const text = TextService.atob(base64)
    return decodeURI(text)
  }

  static atob = (a: string) => Buffer.from(a, 'base64').toString('ascii')

  static btoa = (b: string) => Buffer.from(b).toString('base64')
}
