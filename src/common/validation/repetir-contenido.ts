import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

export function RepetirContenido<T>(
  property: keyof T,
  validationOptions?: ValidationOptions
) {
  return function (object: T, propertyName: string) {
    registerDecorator({
      name: 'repetirContenido',
      target: (object as Record<string, unknown>).constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [keyof T]
          const dto = args.object as T
          return value === dto[relatedPropertyName]
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [keyof T]
          return `${args.property} debe coincidir con ${String(relatedPropertyName)}`
        },
      },
    })
  }
}
