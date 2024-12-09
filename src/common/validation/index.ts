import * as validator from 'class-validator'
import { NroDocumento as _NroDocumento } from './nro-documento.validator'
import { NombreApellido as _NombreApellido } from './nombre-apellido.validator'
import { CorreoLista as _CorreoLista } from './correo-lista.validator'
import { ValidationMessageEnum } from './i18n/es.enum'

const make =
  (_function, _message) =>
  (validationOptions?: validator.ValidationOptions): PropertyDecorator =>
    _function({ ...validationOptions, message: () => _message })

const makeWithOptions =
  (_function, _message) =>
  (
    options?: any,
    validationOptions?: validator.ValidationOptions
  ): PropertyDecorator =>
    _function(options, { ...validationOptions, message: () => _message })

const makeWithTwoOptions =
  (_function, _message) =>
  (
    options1?: any,
    options2?: any,
    validationOptions?: validator.ValidationOptions
  ): PropertyDecorator =>
    _function(options1, options2, {
      ...validationOptions,
      message: () => _message,
    })

// COMMON VALIDATION
export const IsDefined = makeWithOptions(
  validator.IsDefined,
  ValidationMessageEnum.IS_DEFINED
)
export const IsOptional = make(
  validator.IsOptional,
  ValidationMessageEnum.IS_OPTIONAL
)
export const Equals = makeWithOptions(
  validator.Equals,
  ValidationMessageEnum.EQUALS
)
export const NotEquals = makeWithOptions(
  validator.NotEquals,
  ValidationMessageEnum.NOT_EQUALS
)
export const IsEmpty = make(validator.IsEmpty, ValidationMessageEnum.IS_EMPTY)
export const IsNotEmpty = make(
  validator.IsNotEmpty,
  ValidationMessageEnum.IS_NOT_EMPTY
)
export const IsIn = makeWithOptions(validator.IsIn, ValidationMessageEnum.IS_IN)
export const IsNotIn = makeWithOptions(
  validator.IsNotIn,
  ValidationMessageEnum.IS_NOT_IN
)

// TYPE VALIDATION
export const IsBoolean = make(
  validator.IsBoolean,
  ValidationMessageEnum.IS_BOOLEAN
)
export const IsDate = make(validator.IsDate, ValidationMessageEnum.IS_DATE)
export const IsString = make(
  validator.IsString,
  ValidationMessageEnum.IS_STRING
)
export const IsNumber = makeWithOptions(
  validator.IsNumber,
  ValidationMessageEnum.IS_NUMBER
)
export const IsInt = make(validator.IsInt, ValidationMessageEnum.IS_INT)
export const IsArray = make(validator.IsArray, ValidationMessageEnum.IS_ARRAY)
export const IsEnum = makeWithOptions(
  validator.IsEnum,
  ValidationMessageEnum.IS_ENUM
)

// NUMBER VALIDATION
export const IsDivisibleBy = makeWithOptions(
  validator.IsDivisibleBy,
  ValidationMessageEnum.IS_DIVISIBLE_BY
)
export const IsPositive = make(
  validator.IsPositive,
  ValidationMessageEnum.IS_POSITIVE
)
export const IsNegative = make(
  validator.IsNegative,
  ValidationMessageEnum.IS_NEGATIVE
)
export const Min = makeWithOptions(validator.Min, ValidationMessageEnum.MIN)
export const Max = makeWithOptions(validator.Max, ValidationMessageEnum.MAX)

// DATE VALIDATION
export const MinDate = makeWithOptions(
  validator.MinDate,
  ValidationMessageEnum.MIN_DATE
)
export const MaxDate = makeWithOptions(
  validator.MaxDate,
  ValidationMessageEnum.MAX_DATE
)

// STRING-TYPE VALIDATION
export const IsBooleanString = make(
  validator.IsBooleanString,
  ValidationMessageEnum.IS_BOOLEAN_STRING
)
export const IsDateString = make(
  validator.IsDateString,
  ValidationMessageEnum.IS_DATE_STRING
)
export const IsNumberString = makeWithOptions(
  validator.IsNumberString,
  ValidationMessageEnum.IS_NUMBER_STRING
)

// STRING VALIDATION
export const Contains = makeWithOptions(
  validator.Contains,
  ValidationMessageEnum.CONTAINS
)
export const NotContains = makeWithOptions(
  validator.NotContains,
  ValidationMessageEnum.NOT_CONTAINS
)
export const IsAlpha = makeWithOptions(
  validator.IsAlpha,
  ValidationMessageEnum.IS_ALPHA
)
export const IsAlphanumeric = makeWithOptions(
  validator.IsAlphanumeric,
  ValidationMessageEnum.IS_ALPHA_NUMERIC
)
export const IsDecimal = makeWithOptions(
  validator.IsDecimal,
  ValidationMessageEnum.IS_DECIMAL
)
export const IsAscii = make(validator.IsAscii, ValidationMessageEnum.IS_ASCII)
export const IsBase32 = make(
  validator.IsBase32,
  ValidationMessageEnum.IS_BASE32
)
export const IsBase64 = make(
  validator.IsBase64,
  ValidationMessageEnum.IS_BASE64
)
// TODO: falta IsIBAN, IsBIC, IsByteLength, IsEthereumAddress, IsBtcAddress, IsFQDN, IsHSLColor, IsPassportNumber, IsPostalCode
// IsOctal, IsMACAddress, IsISBN, IsEAN, IsISIN, IsISO8601, IsMobilePhone, IsISO31661Alpha2, IsISO31661Alpha3, IsLocale, IsPhoneNumber
// IsMongoId, IsMultibyte, IsSurrogatePair, IsMagnetURI, IsFirebasePushId, IsSemVer, IsISSN, IsISRC, IsRFC3339
export const IsCreditCard = make(
  validator.IsCreditCard,
  ValidationMessageEnum.IS_CREDIT_CARD
)
export const IsCurrency = makeWithOptions(
  validator.IsCurrency,
  ValidationMessageEnum.IS_CURRENCY
)
export const IsDataURI = make(
  validator.IsDataURI,
  ValidationMessageEnum.IS_DATA_URI
)
export const IsEmail = makeWithOptions(
  validator.IsEmail,
  ValidationMessageEnum.IS_EMAIL
)
export const IsFullWidth = make(
  validator.IsFullWidth,
  ValidationMessageEnum.IS_FULL_WIDTH
)
export const IsHalfWidth = make(
  validator.IsHalfWidth,
  ValidationMessageEnum.IS_HALF_WIDTH
)
export const IsVariableWidth = make(
  validator.IsVariableWidth,
  ValidationMessageEnum.IS_VARIABLE_WIDTH
)
export const IsHexColor = make(
  validator.IsHexColor,
  ValidationMessageEnum.IS_HEX_COLOR
)
export const IsRgbColor = makeWithOptions(
  validator.IsRgbColor,
  ValidationMessageEnum.IS_RGB_COLOR
)
export const IsIdentityCard = makeWithOptions(
  validator.IsIdentityCard,
  ValidationMessageEnum.IS_IDENTITY_CARD
)
export const IsHexadecimal = make(
  validator.IsHexadecimal,
  ValidationMessageEnum.IS_HEXADECIMAL
)
export const IsIP = makeWithOptions(validator.IsIP, ValidationMessageEnum.IS_IP)
export const IsPort = make(validator.IsPort, ValidationMessageEnum.IS_PORT)
export const IsJSON = make(validator.IsJSON, ValidationMessageEnum.IS_JSON)
export const IsJWT = make(validator.IsJWT, ValidationMessageEnum.IS_JWT)
export const IsObject = make(
  validator.IsObject,
  ValidationMessageEnum.IS_OBJECT
)
export const IsNotEmptyObject = make(
  validator.IsNotEmptyObject,
  ValidationMessageEnum.IS_NOT_EMPTY
)
export const IsLowercase = make(
  validator.IsLowercase,
  ValidationMessageEnum.IS_LOWERCASE
)
export const IsUppercase = make(
  validator.IsUppercase,
  ValidationMessageEnum.IS_UPPERCASE
)
export const IsLatLong = make(
  validator.IsLatLong,
  ValidationMessageEnum.IS_LAT_LONG
)
export const IsLatitude = make(
  validator.IsLatitude,
  ValidationMessageEnum.IS_LATITUDE
)
export const IsLongitude = make(
  validator.IsLongitude,
  ValidationMessageEnum.IS_LONGITUDE
)
export const IsUrl = makeWithOptions(
  validator.IsUrl,
  ValidationMessageEnum.IS_URL
)
export const IsUUID = makeWithOptions(
  validator.IsUUID,
  ValidationMessageEnum.IS_UUID
)
export const Length = makeWithTwoOptions(
  validator.Length,
  ValidationMessageEnum.LENGTH
)
export const MinLength = makeWithOptions(
  validator.MinLength,
  ValidationMessageEnum.MIN_LENGTH
)
export const MaxLength = makeWithOptions(
  validator.MaxLength,
  ValidationMessageEnum.MAX_LENGTH
)
export const Matches = makeWithTwoOptions(
  validator.Matches,
  ValidationMessageEnum.MATCHES
)
export const IsMilitaryTime = make(
  validator.IsMilitaryTime,
  ValidationMessageEnum.IS_MILITARY_TIME
)
export const IsHash = makeWithOptions(
  validator.IsHash,
  ValidationMessageEnum.IS_HASH
)
export const IsMimeType = make(
  validator.IsMimeType,
  ValidationMessageEnum.IS_MIME_TYPE
)

// ARRAY VALIDATION
export const ArrayContains = makeWithOptions(
  validator.ArrayContains,
  ValidationMessageEnum.ARRAY_CONTAINS
)
export const ArrayNotContains = makeWithOptions(
  validator.ArrayNotContains,
  ValidationMessageEnum.ARRAY_NOT_CONTAINS
)
export const ArrayNotEmpty = make(
  validator.ArrayNotEmpty,
  ValidationMessageEnum.ARRAY_NOT_EMPTY
)
export const ArrayMinSize = makeWithOptions(
  validator.ArrayMinSize,
  ValidationMessageEnum.ARRAY_MIN_SIZE
)
export const ArrayMaxSize = makeWithOptions(
  validator.ArrayMaxSize,
  ValidationMessageEnum.ARRAY_MAX_SIZE
)
export const ArrayUnique = makeWithOptions(
  validator.ArrayUnique,
  ValidationMessageEnum.ARRAY_UNIQUE
)

// OBJECT VALIDATION
export const IsInstance = makeWithOptions(
  validator.IsInstance,
  ValidationMessageEnum.IS_INSTANCE
)

// OTRAS VALIDACIONES
export const ValidateIf = validator.ValidateIf
export const ValidateNested = validator.ValidateNested

// OTHER DECORATORS

// CUSTOM VALIDATION
export const NroDocumento = _NroDocumento
export const NombreApellido = _NombreApellido
export const CorreoLista = _CorreoLista

// VERIFICA SI UN STRING NUMBER ESTA EN RANGO
@validator.ValidatorConstraint({ async: false })
export class IsNumberInRangeConstraint
  implements validator.ValidatorConstraintInterface
{
  validate(value: string, args: validator.ValidationArguments) {
    const [min, max] = args.constraints // Recibe el mínimo y máximo desde los argumentos
    const num = Number(value)
    return !isNaN(num) && num >= min && num <= max // Verifica que el valor esté en el rango
  }

  defaultMessage(args: validator.ValidationArguments) {
    const [min, max] = args.constraints
    return `El valor debe estar entre ${min} y ${max}` // Mensaje de error
  }
}
