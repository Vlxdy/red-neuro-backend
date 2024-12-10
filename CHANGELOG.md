# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.12.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.11.5...v1.12.0) (2024-12-10)


### Features

* adición de servicio "FileValidationService" con validaciones XSS para imágenes y PDFs ([f9b0c6d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f9b0c6df5cce32f8bfc0f767fe20eddae16279b4))
* crea endpoint para obtener usuario por id ([7401704](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/740170411b3c1762a2c954615c33796ade2fe586))
* implementación de cambio de foto de perfil con validaciones de extensión y XSS ([5b5c9f2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/5b5c9f2f6579bf67cec29e6217432841fe75646d))


### Bug Fixes

* adición de nombre de rol en lista de usuarios ([6ec5e23](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6ec5e23bc5d513bc8c053e273292bf07cf378f8a))

## [1.11.5](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.11.4...v1.11.5) (2024-11-17)


### Features

* se cambió la versió de node a 22 y se actualizo las dependencias ([1ecaed8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/1ecaed899572b75f6a5b660ab84a158431245cda))


### Bug Fixes

* :bug: corrección para obtener la IP correctamente ([4ec722c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/4ec722c02e617e5458ee89932365b2c407ae620f))
* :white_check_mark: corrección de los tests de mensajería ([03713ec](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/03713ec0736f724ffb3a577cdaefbed80ea08e4b))
* corregir el comando setup ([3dc7604](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3dc760457c3ddd925a615d22c7c4cb7c0adc4fd3))
* **logger:** :bug: ajuste para controlar posible request undefined ([388ba8b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/388ba8bbc62ee1fb0064f6d1f5d81960dfa0b3a2))
* remover espacio en blanco del script lint ([e5bd777](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e5bd77714fce71e9f52661f0e478ea0d7e819cee))
* validado de roles activos ([119cbcd](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/119cbcdf258fda93fcf2f4f5d8445127720b865a))

## [1.11.4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.11.3...v1.11.4) (2024-10-13)


### ⚠ BREAKING CHANGES

* **logger:** Actualizar variables de entorno

### Features

* :sparkles: se agregó la gestión de errores al validar una ip ([dc3cd9f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/dc3cd9f6324ab1c579360ae9e430284da33657dc))
* actualización de estilo de documentación ([a86d6c8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a86d6c860f7dc311db0df6ce5cc23b56b9017299))
* actualizar automatizacion ([b777c0b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b777c0bf7c7f9a3c47b83cb229732561206c8b63))
* actualizar automatizacion con scripts ([6424425](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/642442547918933412c8134aab0fe2d328fed0de))
* agrega job para tests en el pipeline ([6755f92](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6755f921eecb889743ad89b309a4ec3ddb6a2802))
* agrega pruebas sast ([72c98a9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/72c98a93dfd68dd8c92046fefde66836a6d0f6ff))
* agregar cambios para el turbo ([20935ec](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/20935ec41508ac1eeb9494201ed6e768257ed718))
* cambiar a images estables ([c68901f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c68901faa3cc94a6087618c281728e56682a2a20))
* cambiar condicional para que se ejecuto solo con la rama test ([0501d74](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/0501d74ee781cf8d338a2c8de5f3515cb16a8fae))
* cambiar image ([8f36a31](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8f36a31d234b4098f44b3adc70a0929a4995a6f6))
* cambiar rules de jobs ([edffbb8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/edffbb8a6b4a56a13ea26abb80afc34b3ea8dc7c))
* cambiar tag runner ([c812126](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c812126303ee6ce69e5eb919189fd1aa6ea4fb70))
* cambiar version de image ([40dfb7d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/40dfb7da4ea32c30c271f6b850b619f538a2e47f))
* configurar test con jest ([3b36818](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3b368189e235564685cf69cf75d3827c88896c6c))
* corregir nombre de tag para develop ([701c977](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/701c977073254cab6768523e30277d2ce4b8b0de))
* crea cuentas de usuarios con datos de personas ([cfff7f2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/cfff7f29860d9138938eee03f7404264fe50b627))
* implementar turborepo y test para la rama test ([97efa4f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/97efa4fe9079c8827ba4c43173460c00935c3a18))
* **logger:** ✨ ajuste para las nuevas funcionalidades de logger ([accc486](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/accc486d4159c4d902bf42088406c2545173a140))
* **logger:** ✨ mejoras y correcciones con el manejo de streams y pino ([f45d168](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f45d1686ed12adfe1e6ed5d1b02ff562493dbc6b))
* probar cambios ([31994d2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/31994d25b269be686387d8e99f5b0578b1631955))
* probar en test-pipeline ([2b2ae33](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2b2ae339908c8f4ff36d63f3145a72e61c7f3e84))
* probar modificacion de package ([4e57e99](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/4e57e990b45d1cd46c3d3b7d21240ec67ed63872))
* terminar pruebas de cacheo ([665ef63](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/665ef6338de2c027114959fc262e96d83a15ef48))
* ver valores en trivy ([fecdfb1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fecdfb1830b30500fad8fe9c6057f40179abffa2))
* volver cambios atras ([c6dd003](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c6dd003638ec8743a05da75f6708f7907e66ce59))


### Bug Fixes

* :package: se reemplazó el paquete ip por ip-address ([a10a120](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a10a1207a398d93b6d026c66879e66171134a687))
* actualizar tags ([8aa9b12](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8aa9b1240478d678c60ac2cab3dd8f9e75d19378))
* actualizar tags ([61c648c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/61c648cb002e341de03b3e1277fed431e82348d5))
* agregar diagrama de arquitectura y ajustar pipelines ([f8fa534](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f8fa534476d67a90f5b3c0e0ebb667d5b8a7b733))
* agregar packagemanager al package ([2b24b23](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2b24b23551eaacc840c7059154345db6907508b9))
* agregar turbo al merge ([6fca243](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6fca24377718333172735d8bae54ea97840519f0))
* ajustar pipelines ([35ea332](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/35ea3328a11282d2a496f83c7a93fe8cccbd183a))
* ajustar rules de jobs ([dc6faba](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/dc6faba63256e17226d9675ad4e0f08751c3f685))
* añadida función decodeBase64 al registrar una nueva cuenta, denominación de tipos de Ciudadanía y Correo ([c270df3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c270df3968cdd572e9a40777960498db428e6d3c))
* apuntar a nuevo script ([b9832b6](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b9832b6da6c5f81d6ff17739f11265b602732b6f))
* arreglar donde apunta el merge ([69c97cd](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/69c97cdae1276beafd874da17d903ef77b695054))
* arreglar git pull ([02fa07d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/02fa07d51055a025f78e0fa42a59467b047aa97c))
* arreglar package.json ([2ced839](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2ced83902f1776840504b0a4c8e7437fb05e5da0))
* corregir conflictos pull ([4713c73](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/4713c731f4ae09c1a5b12759cdb5e1c83b7a65db))
* corregir k8s-dev ([e6f4e69](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e6f4e69fe6d622b47f2dbf2cb2e08142d7f81cd4))
* corregir merge ([423d4f7](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/423d4f75637bcb2ef32ffb4efdda371079323c77))
* escuchar evento merge para trivy ([49e43be](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/49e43be5bf0b0a10ff2127d05163aa957863e8d7))
* **logger:** :bug: ofuscando datos sensibles (OWASP A09:2021 mitigation) ([7b46c6a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/7b46c6a7b18f73c4ab2068a9e2f2b375a567b7a7))
* modificar merge de develop ([e510b0d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e510b0d78c122a8aeec1d73fdad04fc484b2b17f))
* probar cambio de envs ([351f489](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/351f4893fa612a965375ed9608d89c5a5a54ef17))
* usar environments para el dockerfile ([879cacc](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/879cacceede2b8d4ffa2c0ca6e387f7d9c682579))

## [1.11.3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.11.2...v1.11.3) (2024-07-28)


### Features

* agregar -D ([24a4ce2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/24a4ce2159b2ba2c19b7d7a70f3959a0d2a3a328))
* agregar cambio de imagen ([58e605a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/58e605aeb9a2183f680dae885b058ca78a146764))
* cambiar images del pipelines ([3586e47](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3586e47b3f5e1daa1d70c98c052fa812981d372d))
* cambiar la condicional para test ([c04e4db](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c04e4dbedfa72f08b2ed884a8e3147f05a4d0e38))
* cambiar sin tags ([20eeee6](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/20eeee6411e4fb35ae64ce5f2ca2d606f1ca099e))
* cambiar tag ([e44b95b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e44b95bbdc7120697d6d031a41b2e9d5c20588dd))
* configuracion con scripts ([cd3b4d1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/cd3b4d1396309777838a9c435c691c3d37c68199))
* configurar automatizacion ([9000137](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9000137815274dd2f10d2cf3c1e478fa4264bae7))
* log del deploy argo ([efc9120](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/efc912016ea7bee902d8369b2f35fc54baa31e7f))
* resolver conflicto del merge ([e72b309](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e72b3097c604af5bceecd06ef366e2239302e729))
* usar imagen version 2 ([af71b39](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/af71b397ad874b4efc3ced6ca4d34245eb581414))


### Bug Fixes

* cambiar nombre de tag del runner ([e015b68](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e015b687b6eb2e6d4d2dd15cc5fb8c9318857833))
* cambio de usernameFromContext por userFromContext desde nest-authz ([076dbd1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/076dbd1e3e83cb61a454d582d3fb16e5c164d81b))
* corrección en sintaxis de uso de URL para evitar contatenación de parámetros ([00e262f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/00e262f53d26ce94cf221c6d8dd0236593c18e09))
* corregir k8s ([66b2ce9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/66b2ce91c85d4cec39ac6e558a13879b3eaaa64d))
* log error ([478dab8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/478dab846649f14095c33921e0b3bf020cd3e39e))
* modificado número de saltos para generar un Hash a 15 ([69bf5d0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/69bf5d087b8d08c8b41371d140592461bcdfb8d7))

## [1.11.2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.11.1...v1.11.2) (2024-06-09)


### Features

* actualización de dependencias NestJS 10.3.9 y otros ([8ca8300](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8ca8300c38207cbd1b80ea83659d3f1a22b3683b))
* implementación de node:fs/promises para uso asincrono de sistema de archivos ([8086f46](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8086f4614063114180cc72ede89fd28b32968260))
* se agrega **commit-and-tag-version** en reemplazo de **standard-version** que fue deprecada ([f8a607b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f8a607bf409a4e668cf6670882de9f291a1e531a))


### Bug Fixes

* corrección en doble declaración de ApiProperty en DTO de actualización de parámetros ([fc99c29](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fc99c29254f7c9f2be669b14967c00bba783e392))

### [1.11.1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.11.0...v1.11.1) (2024-04-21)


### Features

* cambio de estados genéricos a estados espesíficos por módulo ([9ba53ef](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9ba53ef7b09b9bab13c7575da2e391ce0e514605))


### Bug Fixes

* actualización de dependencias NestJS 10.3.7 y otros ([fc021bd](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fc021bd038ead109fcd4f853cafb007b0f2536c4))
* adición de @types/passport-jwt y actualización menor de dependencias ([ec6242f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ec6242fc613e462e005739ef15fe278e4ce15161))
* corrección en importaciones de utilidades de validación en lugar de Class Validator ([497d765](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/497d7652a11be9ad11f41303494e4d80245901de))

## [1.11.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.10.0...v1.11.0) (2024-03-16)


### Features

* aplicando alias en las importaciones del módulo Parametro ([b692433](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b6924330cfba5d37fc97c26bfb4b941c67518f88))
* mejora de descripciones de API, para claridad y consistencia ([54e6a0d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/54e6a0d0aaacffe0a63a7f00a6658a36d89c55b6))
* se agregó la columna descripcion a la tabla rol ([4d00f94](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/4d00f94535eb6ec02d8bfd81a30187d9399a3348))
* se cambió las importaciones con rutas relativas por las rutas con alias ([f664588](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f664588fc1d4661615dbea82ac1e82310574a17e))


### Bug Fixes

* configuraciones faltantes para el mapeo de las rutas con alias en los tests ([71c8c8e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/71c8c8ec6e0e42de29add1244e95bcf99c637c9c))

## [1.10.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.9.3...v1.10.0) (2024-03-10)


### ⚠ BREAKING CHANGES

* el identificador de Ciudadanía digital se guarda en tabla persona al iniciar sesión

### Features

* :sparkles: actualizando códigos de error ([415c2a3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/415c2a30104cc427739f1273c6f26103c8851ae9))
* :sparkles: actualizando los códigos de error y se agregó el tipo DTO_VALIDATION_ERROR ([ea48d89](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ea48d89fcf30340c15773a5a9004c042035a310d))
* :sparkles: agregando la impresión de logs para la query y el body para el modo debug ([9a2e2fa](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9a2e2fa7a570ac818a70027e1736043c647810db))
* :sparkles: removiendo el código de error de los mensajes que se envían al cliente ([f9ac4d3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f9ac4d3389fc29c6b1a3b3f40655e303cbab665d))
* **Ciudadanía:** adición de teléfono y uuid_ciudadania a la entidad Persona ([91c3e9d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/91c3e9dc6456f40e60c1e45f3835b504c6870d09))
* logout en caso de restricciones ([f6c0c72](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f6c0c729b9f1fc60cf6c8ae501b28fcc914a223d))


### Bug Fixes

* corrección en comando "compodoc" para generar documentación técnica ([fb5fc21](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fb5fc2139439516f8585c5cad8cbc9bb8059c905))
* correcciones en el repositorio de usuarios ([0a01815](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/0a01815e6c8de4d0087c7f76cbb35a7f3ef13a38))


* corrección de nombre de variable de "uuidCiudadano" ([6a400f4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6a400f40a35587edc642547d999e90c444ca7a2e))

### [1.9.3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.9.2...v1.9.3) (2024-01-21)


### Features

* :sparkles: se agregó el decorador SetRequestTimeout para controlar el tiempo máximo de respuesta para cada petición ([79f275e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/79f275e625f8b878c2425083b3313d3a55d99e02))
* actualización de dependencias Nest 10.3.0, TypeORM 0.3.19, TypeScript 5.3.3 ([ac24412](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ac24412bfd3567562a8a6f6c9123a22dd55899c0))
* añadida regla "require-await" para asegurar el uso correcto de Async/Await ([61db7ec](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/61db7ece48b3514a3ff7a9db7f354422d2f9f35e))
* archivo params/index.ts habilitado por defecto ([6c99421](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6c99421771b8e72c1a1cc0386c800857af18dec0))
* se añade regla de EsLiint que valida la ejecución de promesas no controladas ([b50064c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b50064c81c77589a558627448b3be78fa00ab0ae))


### Bug Fixes

* :bug: cambio de versión de bcrypt para evitar problemas cuando se despliega con docker ([074ad32](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/074ad322a6ca765d57e9e99f8f48a5739f440459))

### [1.9.2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.9.0...v1.9.2) (2023-12-03)


### Features

* :sparkles: upgrade mejoras y correcciones del módulo de logger ([97a735e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/97a735e77a66305a738cf1bd5a479cef68e1def8))
* actualización de dependencias, soporte para Node 20 🎉 ([f4ed6df](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f4ed6df8b9a9c0247b2b578a636b499797c9c1a9))
* se agrego documentación en formato OpenApi para controladores y dtos ([e5d9b65](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e5d9b65c5d4d0228daca48d98d47e53366e6cfc2))


### Bug Fixes

* adicionado tipo de documento "CIE" entre los tipos de documento permitidos para personas ([c5b4432](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c5b44328d00ea3ff7ca39431c003bc53c8173bd8))
* correcciones de espaciado entre sentencias condicionales en nueva versión de Lint ([6e17bd1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6e17bd1ef71771e9fc7c5e64794a8df7a9bccc19))
* corregido error ocasionado al registrar un usuario con el registro de una persona existente ([b402e8d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b402e8ddec969e80dd55a0c68a4901d9e100d4eb))
* corrigiendo y añadiendo swagger a los endpoints ([fb9ef4a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fb9ef4a79c08d90fc2508a964d90414aecba6ee0))
* corrigiendo y añadiendo swagger a los endpoints ([2b65045](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2b650451ab882ce2dfca4fc45f9716dc45a1f953))

### [1.9.1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.9.0...v1.9.1) (2023-10-26)


### Features

* :sparkles: upgrade mejoras y correcciones del módulo de logger ([97a735e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/97a735e77a66305a738cf1bd5a479cef68e1def8))
* actualización de dependencias, soporte para Node 20 🎉 ([f4ed6df](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f4ed6df8b9a9c0247b2b578a636b499797c9c1a9))
* se agrego documentación en formato OpenApi para controladores y dtos ([e5d9b65](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e5d9b65c5d4d0228daca48d98d47e53366e6cfc2))


### Bug Fixes

* adicionado tipo de documento "CIE" entre los tipos de documento permitidos para personas ([c5b4432](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c5b44328d00ea3ff7ca39431c003bc53c8173bd8))
* corregido error ocasionado al registrar un usuario con el registro de una persona existente ([b402e8d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b402e8ddec969e80dd55a0c68a4901d9e100d4eb))
* corrigiendo y añadiendo swagger a los endpoints ([fb9ef4a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fb9ef4a79c08d90fc2508a964d90414aecba6ee0))
* corrigiendo y añadiendo swagger a los endpoints ([2b65045](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2b650451ab882ce2dfca4fc45f9716dc45a1f953))

## [1.9.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.8.1...v1.9.0) (2023-08-17)


### Features

* :construction: actualizando los códigos de error TG-11 ([db54f62](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/db54f626c74b2d20824221b472cc67a37cbb8277))
* :construction: actualizando mensajes de error para los guards TG-11 ([198bda3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/198bda330e72a05f557cb6c132b53fd62125b642))
* :construction: ajustando formato para el registro de logs TG-11 ([711e68e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/711e68ed4f8c83614fbd97895d2d2ad99ef9e699))
* :construction: ajustando logs con el nuevo formato TG-11 ([4fc9534](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/4fc95347e28c00685cc20e45afb34636d2d1be6a))
* :construction: ajuste en el campo detalle de ErrorInfo TG-11 ([1e89ce3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/1e89ce3494cd1917ea4eb218d403735bd2cb1817))
* :construction: mejoras y correcciones en el módulo de logs TG-11 ([bffcfa9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/bffcfa9ad3af28e0da73de0ce9574269a6dd2fe6))
* :construction: módulo de logs versión 2 TG-11 ([4c1e14d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/4c1e14df1aa56a90733565dcdaa91eed7b96de61))
* :sparkles: actualizando logs de auditoría para el casbin ([8c998d6](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8c998d65d295a7321abfd3dcec02d9aa6f5e8f7e))
* :sparkles: agregando config para levantar grafana en local TG-11 ([a2e1647](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a2e1647270fc62a7bdb1aa71c5d58f5d904b8264))
* :sparkles: agregando config para mostrar logs por consola ([be4c249](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/be4c2493678a2c07b623b3dd19871acc8b1e954b))
* :sparkles: agregando custom exceptions ([4520443](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/45204435abc0e6dddfdd1cc4b7eab98021113a98))
* :sparkles: agregando el campo código de error TG-11 ([d9e60ec](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d9e60ec3b208ec180dad313636decb0ea6fab905))
* :sparkles: agregando el campo código de error TG-11 ([646a46c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/646a46c19603b6da996175ae5612a35c47edb7c6))
* :sparkles: agregando el campo fecha formateado TG-11 ([4cbda69](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/4cbda695d02794da05e54ea56955342d61967890))
* :sparkles: agregando la funcionalidad logger.audit() TG-11 ([d44e0aa](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d44e0aadb8e6a811ad0a7bc56c4ee87db9179113))
* :sparkles: agregando pid en los logs de auditoría: ([8db8452](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8db845284d7eec375455ed9bbe874f89c31591b0))
* :sparkles: agregando reqId a los logs de auditoría ([fa1852d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fa1852d5611a1153a353cdb7f9701801243845f5))
* :sparkles: agregando tests para el registro de logs TG-11 ([2a3a189](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2a3a189278190dd0d106377e976800fb75e82561))
* :sparkles: ajustando config para el TimeoutInterceptor ([92b8494](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/92b849447806c65caca0c95a3a6bd53759d8390b))
* :sparkles: ajustando config por defecto para el registro de logs ([eaf0e4e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/eaf0e4ee8cf3423b5bdc31ce8248b5c448cf8f57))
* :sparkles: ajustando nombre de variables para los logs de auditoría ([5ab2652](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/5ab265201211a7067a7430d88dfaee61ddb55f47))
* :sparkles: ajuste de formato para errorStack TG-11 ([75e1c47](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/75e1c47a45648f15a0de2da4286e84ffe3179885))
* :sparkles: ajuste en el formato del error de conexión TG-11 ([11fd5aa](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/11fd5aafb2a23d30d55dc56522713a994d0b2fb3))
* :sparkles: ajuste en el nombre de los ficheros de logs ([d6cd52d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d6cd52d22659e619238f14a62ba73ec84c6734af))
* :sparkles: ajuste en el origen para casos del tipo logger.error(msg) ([9214dc2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9214dc2d684cf4b6b735d50e61fcef427dae8e07))
* :sparkles: ajuste en error stack para que las rutas se vuelvan enlaces ([83b6db8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/83b6db8a2b019dc2e4f9a1302fcf6049ee544e2f))
* :sparkles: ajuste para compatibilidad con versiones anteriores ([cffd9bc](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/cffd9bcfd93af78f3fb69e014c7ff39c1ddd6cae))
* :sparkles: ajuste para evitar duplicidad de registro de logs ([8dcd7d4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8dcd7d44fbf4e0841009522e04cea97e1160c8c3))
* :sparkles: ajustes en los campos error, codigo y causa TG-11 ([5fc1f45](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/5fc1f4513f7e7bee035954e89113158a3d8c15a4))
* :sparkles: ajustes para la función logger.error() TG-11 ([99502af](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/99502af481889ef1cdbfbe13bba2e3d1138a2ddf))
* :sparkles: ajustes para mantener la compatibilidad con veriones anteriores ([0e9158f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/0e9158f4d31e97012469eb331a6183b8a829bdce))
* :sparkles: baseLog agregado para el registro de metadatos TG-11 ([a208ced](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a208cede6bd7f922cd22727d98dede324b55cb08))
* :sparkles: cambiando detalle por metadata TG-11 ([d9e8718](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d9e87188b9cb73d72d0d0b69feb10bc2f2825a17))
* :sparkles: cambiando sistema por appName TG-11 ([45ec3a9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/45ec3a963360c2e374f6a73904f179ad5ee472f9))
* :sparkles: exponiendo funciones getIPAddress y getReqID ([817df2b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/817df2b2cceb5504eec469fbd0fc1cb4f05af7cb))
* :sparkles: función para habilitar logs en tiempo de ejecución ([bf15239](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/bf15239d48c389f3b77999964bd009534204776d))
* :sparkles: funcionalidad para imprimir logs por consola ([eb30f2a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/eb30f2a6e4258522e17bc92fc018a1afab194213))
* :sparkles: logs de auditoría para el servicio de mensajería ([562653e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/562653e4a761bad2aca45a2cbb67d96fd54d6895))
* :sparkles: mejora en la definición de rutas con diferente tiemout ([9cd3cb1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9cd3cb14fccd514d36a2f49ae02187dd6194cc3a))
* :sparkles: mejoras en el valor del origen del error ([6f0494e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6f0494eabe65661bfa374432f0dbdd39c3801f48))
* :sparkles: removiendo campos redundantes de mensajes de tipo info ([a2ca3c6](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a2ca3c62adc89c80a2f954275a8d924504fd9376))
* :sparkles: removiendo config de grafana ([a530ff7](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a530ff760340d4e8f6c4986cbb9233e299c538c9))
* :sparkles: se agregaron tipos de logs de auditoría ([daaad83](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/daaad8323c4d1ea6790d587e968a0a6826ed44f8))
* :sparkles: se agregó la función audit ([639d646](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/639d6466579dcda4599f8c692c9cb5e2babeee18))
* :sparkles: separando ExceptionManager del módulo de logs ([e8b6f4e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e8b6f4e1a32ed15b34eeb2816fc0ca92144375f7))
* agregando ejemplo del campo origen en ErrorInfo ([78029c5](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/78029c5a848be45b6eed98461f282f0181e277d4))
* funcinoalidad para imprimir mesajes de error desde ErrorInfo ([1ab89db](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/1ab89db3f42b42fba8ed3920f714d251ad5c1fbd))


### Bug Fixes

* :bug: cambiando a rutas absolutas en el stack del error ([893788a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/893788ae70b9f925f4d5e66beaa479120c355cec))
* :bug: corrección en LoggerMiddleware forRoot ([af7fa91](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/af7fa91550e8f81d1066979a3f50134bd671fc5e))
* :sparkles: ajuste para evitar conflictos con palabras reservadas ([888a43c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/888a43c117227633ae34c5a8d9bb0d43f4512a41))
* corrección en actualización de datos de usuario, en caso de no usar validación de Segip ([ab9d23e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ab9d23e9ecd6d4b1c47ca036f4f9c84edc1bd713))
* corrección en el constructor de excepciones de logger ([232ad6f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/232ad6fbc74e2dd18ab1fc6ebfa233904d2b0d55))
* correcciones de tipado en peticiones y separación de lógica de negocio desde respositorio de usuarios ([ff12d28](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ff12d28764f427e3ae441880d5ee356ef25b3bd2))

### [1.8.1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.8.0...v1.8.1) (2023-08-09)


### Bug Fixes

* se añade PoliticaDTO para controlador y servicios de autorización ([b5a14d9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b5a14d911df12de4bcba0fd9087e194789a4a582))

## [1.8.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.7.3...v1.8.0) (2023-07-28)


### ⚠ BREAKING CHANGES

* El ID de rol activo se incorpora en el token

### Features

* actualización de dependencias NestJS 10 ([23b620d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/23b620ddf1aa4b02b855d53fdef3d7b650744b29))
* añadida función de validación de token JWT al hacer el cambio con refreshToken ignorando la expiración ([19c342c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/19c342cb4f3af38cc3d45c008547d33493f95b50))
* añadido tipo genérico que servira para inferir el tipo de respuesta en controladores ([a8ca1ce](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a8ca1ce132984565cad4b8e2fabefde5edcc7041))
* cambio de rol ([4554e4f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/4554e4f5f0c1dd690e5361ea2d35f0fdc8af409e))
* cambio en API de perfil para retornar rol activo ([b67b49c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b67b49c0a378563f84502cb2a933125a7cbabdff))
* comentarios para entity de usuarios ([6bc2328](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6bc232853b98504547363dcbd1fe3d57e8a551c0))
* refresh token ([b003702](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b0037023efec8704eb94bd28b2e9e33d4f645a6c))
* se adiciona idRol en token ([958e8c9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/958e8c91a67d43597fc0564ea170aa2039d80143))


### Bug Fixes

* correcciónes ([612591a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/612591a995a63370e4a979afd566e9996a9d70dd))
* correción de ortografía de comentarios ([eea8da8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/eea8da85ca48cac8c20532eb5d46191a81df6a03))
* corregida asignación de rol inicial a proveedor de identidad ([5f73fa1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/5f73fa13b2c63c908dceb76b0d4f32cae0c3fd62))
* corregido log de error, solo en caso de JsonWebTokenError ([fea3fd7](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fea3fd7810400d699edcbdee6cb46694f1077c88))
* mejorada gramática de mensajes de respuesta ([c50fd65](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c50fd657a2f2bd520ad1f7e3297e32375b204982))
* modificados test unitarios para nuevos métodos de obtenerRolActual y buscarUsuarioPerfil ([7da5d78](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/7da5d785e49d8b601299e64a31d9722be5f21b61))
* se agrega 'rol' en token para validar únicamente ese rol en Casbin 🛡️ ([e41b7ff](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e41b7ffa8007b2d96d5c7389c89608aaf3bed11b))
* se añade tipado faltante en variables y funciones de repositorios y servicios ([fba4a12](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fba4a122a823a392bf337b49a6b1a7cd21e51539))
* se define comentarios de campo de RefresToken ([c75b09b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c75b09b74084e4cd7722eaec15105cebb635ce93))
* se define comentarios de campo de UsuariosRol ([b20ab7e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b20ab7e4ddf814ab0354437864f3029a2ca601ba))
* se define comentarios de campos de Auditoria ([a7f1939](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a7f1939c5cd546e4ac1847050dc7e5915b3606ea))
* se define comentarios de campos de casbin ([04b69b0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/04b69b0c7f1f2954ccf15dc8189daa75cc6a622c))
* se define comentarios de campos de modulo ([c4579d9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c4579d9794ab7ab56e0421de9db91d3c5f19e8ae))
* se define comentarios de campos de Parametro ([106779b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/106779b64b6cddadf3e16e8e2665e884541c425b))
* se define comentarios de campos de Personas ([bec8f7d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/bec8f7d24646fb500ca40e3ab6f4901c6705579b))
* se define comentarios de campos de Rol ([587a535](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/587a535cea967922fc825a541c008b482b7005f5))
* se define comentarios de campos de Sesión ([d8b0a24](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d8b0a2436c6656924c56dfafa9045de12f5c6a1f))
* se eliminan tipos QueryDeepPartialEntity ya que TypeScript infiere los tipos ([c365cf9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c365cf995075ccf42130deb4c2d211148a1c199a))

### [1.7.3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.7.2...v1.7.3) (2023-07-14)

### Features

- agregado tipo 'PayloadType' para controlar el tipo de Payload que se va a firmar ([ed584a4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ed584a4b31ad8fc82b9cff4ed4236f7db74c8564))

### Bug Fixes

- corrección de codeSmell en filtro de roles para payload en función de refreshToken ([3d1e274](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3d1e2746a04eb11eb830030320af3a2713d79aab))
- corrección de error que ocasionaba que se despliegue API-DOC en producción 🤦‍♂️ ([3ff5fc0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3ff5fc02d249085a2d6a43179d2bba21e4fbac16))
- corrección de tipado en instancia de Enforcer de Casbin ([149a30b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/149a30ba14184c2ffc48dc332ec2c7cd810a9ad2))
- corrección de valor duplicado en es.enum.ts ([10cecc8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/10cecc8d53ef8a7af095bdbd19f290a23a43175a))
- se corrigieron sentencias where anidadas de los repositorios de TypeORM usando brackets ([d6af383](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d6af383250f460dc42747afbeccf2c1f7ed57f8f))

### [1.7.2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.7.1...v1.7.2) (2023-07-03)

### Features

- actualización de dependencias NestJS 10 ([84c91fb](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/84c91fb48d1a935331aed0b8ebb73b23ec75ba05))
- comentarios para entity de usuarios ([65f78e7](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/65f78e7514b68a28788df64aa077e1ccd86cea53))

### Bug Fixes

- correcciónes ([540cb42](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/540cb425631e188c82ac14378db3c333fa7bbda8))
- correción de ortografía de comentarios ([a7a9b20](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a7a9b205b89aaa7af6bc57f60462946ff2e080c0))
- se define comentarios de campo de RefresToken ([35e9709](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/35e9709223f2ebaf189d78afc543519f49efcc20))
- se define comentarios de campo de UsuariosRol ([deb6076](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/deb60760ef339ba9541ad99dc8d0f6c6806732a6))
- se define comentarios de campos de Auditoria ([743cbc9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/743cbc9733f8789c863b0cc65135c0901d0c5e89))
- se define comentarios de campos de casbin ([88f8874](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/88f88746ea2beac431ab16ffba60038a63790908))
- se define comentarios de campos de modulo ([b939c77](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b939c7779d3489250ad975983abe781e93b70544))
- se define comentarios de campos de Parametro ([91df9f3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/91df9f34af2d67be57a22335e4ca760d9347338e))
- se define comentarios de campos de Personas ([3e9b28b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3e9b28b0bade4b305e1cddd788698be10dfb87cc))
- se define comentarios de campos de Rol ([387fec8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/387fec8f444c19615dc8c95b819ee30d2aeb79df))
- se define comentarios de campos de Sesión ([0104878](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/01048785055471cae4f2059d970a8c2c669541a5))

### [1.7.1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.7.0...v1.7.1) (2023-05-22)

### Features

- añadida ordenación para módulo de módulos ([ff599e5](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ff599e54da0e1266dc615beecf13f51678ea2f8b))
- añadida ordenación para módulo de políticas ([a24e0b8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a24e0b851c31b8424e9430d8e21cf35ee6578366))
- añadida ordenación para módulo de roles ([b7bfb2a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b7bfb2af787218257b3f9a0cdc16280bc6daeaa8))
- añadida ordenación para repositorio de parámetros ([77a8c1a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/77a8c1a3944c26ac88930345d6ad8bb566a39762))
- añadida utilidad que determina el valor del campo y sentido para criterios de orden en repositorios ([9469697](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9469697d9b9be620cc368708012fc4c744605229))
- añadido filtro de estado activo para lista de grupo de parámetros ([0b60503](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/0b60503141e0115a574bd4f363fb07f5cb7b7170))
- añadido parámetro de ordenación para repositorio de usuarios ([dcff7b4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/dcff7b4e5b71796febb0aa342f4edd82c7ed0e5c))
- añadidos varios criterios de ordenación para lista de usuarios ([7ed7dec](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/7ed7dec6ceeb8096f16224a80e91a4b9d1ba6c33))

### Bug Fixes

- :bug: cambiando el método de impresión de logs por consola ([8439a0a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8439a0af2ce246fa700268c70263c1da7a1e4044))
- corregido tipo de dato de rol para DTO de usuarios ([62981c4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/62981c4684cb715171eceeb6ffc21ec848c1384b))

## [1.7.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.6.6...v1.7.0) (2023-04-02)

### Features

- :sparkles: ajuste en los comandos de ejecución de scripts ([cffa063](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/cffa063c73f1ec398cacde3c04fa1d2204bf032e))
- :sparkles: ajustes para mostrar logs junto con jest ([075b1e9](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/075b1e90e71e9e7914295c0a7a51de48188802b4))
- :sparkles: controlando posibles errores al imprimir mensajes con logger ([e49748d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e49748d7060509968ebc0a7e5563e8dd3bb09eb5))
- :sparkles: mejoras en los mensajes y registro de logs ([b7a1cea](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b7a1cea04ce131a1f00c18d59ecefd2e047f8474))
- :sparkles: parámetro para guardar logs en una subcarpeta ([65a4147](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/65a4147ed2db76880e706be3fa35f034dcc7438d))
- :sparkles: registro de errores de las consultas SQL sobre los ficheros de logs ([425055c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/425055ce2c989213d67d90fd21b2b893257a26fb))

### Bug Fixes

- :bug: correciones para cuando se utiliza el rotado de logs ([070704d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/070704d5880568d549dc15d9b2529d2c1ab0853c))
- :bug: correciones para cuando se utiliza el rotado de logs ([8849782](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/88497824c30f6640f6616e83a32964e792613aec))

### [1.6.6](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.6.5...v1.6.6) (2023-02-26)

### Features

- :sparkles: agregando tipos al seeder del casbin ([d5cdd7d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d5cdd7d75c34f41351b2bf4a051e03dfd6a4c8f3))

### Bug Fixes

- :bug: resolviendo problemas de instancias por contexto en LoggerService ([3e9d12c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3e9d12cca316fc2672e08acb729f0c62bf8a36c3))
- ajuste en el query para filtros en rol.repository ([b8b61fc](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b8b61fcc7a94e54be25965c63fc224c776e507b3))
- añadido filtro de nro. de documento para repositorio de usuarios, cambiando a filtro de consultas con Brackets ([85c1d35](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/85c1d35751d329c8b2f3c0ecd53725f08b392604))
- corregido mensaje de validación de correo como usuario existenten ([d00a5f6](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d00a5f6e4eec351e5a85237713f59ad799f86fff))
- corregido ordén de lista de módulos y submódulos ([1c668bd](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/1c668bd39b33af082b9273c9b87b998e672f7267))
- corregido permiso de cambio de contraseña en seeder de casbin ([ba63c23](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ba63c230c1b994edd671f6eebe84d176076a36ce))
- refactorización casbin rules ([e96f78b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e96f78b3abe4ee12019ce8018d9f5779e879972e))
- se corrigieron las validaciones de la propiedad de orden de los módulos y las descripciones en los seeders ([7576559](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/757655931546561752243265631776279fb8ddea))

### [1.6.5](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.6.4...v1.6.5) (2023-01-24)

### Bug Fixes

- cambio de versión a ES2021, dado que TypeORM no es compatible con ES2022 ([b01bf83](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b01bf83ff01f5f6d23d24b49d03e5dc817c36bf6))
- corregido tipado de respuesta de funciones de authentication servicio ([4ffc906](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/4ffc906b2f37ed9b6b79bf0880dee33fd4d17022))
- estandarizado formato de actualizar usuario DTO para que sea similar a otros servicios 🧹 ([1fa10ef](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/1fa10ef253f59a727fb29cb3fefdf8112642bd15))
- estandarizados formatos de peticiones para módulos y roles, con sus respectivos DTO's ([2dc68ac](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2dc68acddb445be7af00dc10dbbd08871a216abd))
- habilitados test para analisis en de lint, corregidos test de usuario service ([3a51f4b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3a51f4b78258120df1b3221256d3ccd2de0586ff))
- validación y corrección de test de parámetros ([05f2f38](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/05f2f382ee51326027907a6c69a9cc6c5323f08e))

### [1.6.4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.6.2...v1.6.4) (2022-12-11)

### Features

- ajustes node 18, ahora que es LTS ([6a34980](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6a34980d0185baeebfd2bc25177cde9b4ff6f73d))
- crud de roles ([902f7f5](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/902f7f535f36933c91389d48d12240fbc8367e7c))
- **fix:** se arreglo el comando setup en CI ([72e8616](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/72e8616f1b1d5458706a63008c7474d19a302ce0))

### Bug Fixes

- actualización de dependencias, corrección en mensajes de correo y estado de activación de cuenta ([49f87d8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/49f87d8e72d2395bb4d996a6727f80ef068c02c6))
- ajuste en seeder para creación de registros con fecha por defecto y usuario sistema ([9b4e1e1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9b4e1e121bad106c641fc75294b2adf332f7028a))
- ajustes en loggerService para evitar logs gigantescos causados por axios ([8ef145d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8ef145dc513ca9becf6f299570af691134a88b73))
- cambio de nombre de api de roles-table a roles-todos ([f830318](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f830318ab5ca90a7621374218cbcd16bfaa671c8))
- cambio de nombre de meotodos de roles-table a roles-todos ([c96fcbd](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c96fcbde574da9581e5a067cb150f85e8f901ff0))
- cambio de ruta rol a roles ([d5726e1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d5726e15ee5801ef3c60e9d2f4126bcffabee1d7))
- cambios de fid_modulo a id_modulo y removiendo el término módulo padre ([a934fde](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a934fde5576b2afd392e8a105ab3fb11485dc32f))
- corrección en busqueda de políticas, que ocasionaba que los filtros no funcionaran ([73b81f0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/73b81f0e7f31b5f35218b1e9c8fdca0978e92268))
- corrección identificador de módulo para seeders ([005f274](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/005f27479f7592b460ce1da690b640bf94e2a939))

### [1.6.3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.6.2...v1.6.3) (2022-11-09)

### Features

- ajustes node 18, ahora que es LTS ([6a34980](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6a34980d0185baeebfd2bc25177cde9b4ff6f73d))
- crud de roles ([902f7f5](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/902f7f535f36933c91389d48d12240fbc8367e7c))
- **fix:** se arreglo el comando setup en CI ([72e8616](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/72e8616f1b1d5458706a63008c7474d19a302ce0))

### Bug Fixes

- ajuste en seeder para creación de registros con fecha por defecto y usuario sistema ([9b4e1e1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9b4e1e121bad106c641fc75294b2adf332f7028a))
- ajustes en loggerService para evitar logs gigantescos causados por axios ([8ef145d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8ef145dc513ca9becf6f299570af691134a88b73))
- cambio de nombre de api de roles-table a roles-todos ([f830318](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f830318ab5ca90a7621374218cbcd16bfaa671c8))
- cambio de nombre de meotodos de roles-table a roles-todos ([c96fcbd](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c96fcbde574da9581e5a067cb150f85e8f901ff0))
- cambio de ruta rol a roles ([d5726e1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d5726e15ee5801ef3c60e9d2f4126bcffabee1d7))
- cambios de fid_modulo a id_modulo y removiendo el término módulo padre ([a934fde](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a934fde5576b2afd392e8a105ab3fb11485dc32f))

### [1.6.2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.6.1...v1.6.2) (2022-10-26)

### Features

- cambiando a plural los nombres de las tablas ([15898b3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/15898b3cb775cfa2fb861b0b03fc33c39c954d0c))
- cambiando por defecto SQL_LOG a true ([f5e7308](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f5e7308a69a0d43976f39a52cab2299170ca3c43))
- cambios en el comando de ejecución (npm run start:dev:sql) ([c98cf24](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c98cf248a7b05b21542bf0f24b67db7198e88e5d))
- cambios en los logs para las consultas sql ([960a6d0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/960a6d05c861a302a4e14179e7aab3006d53fd5b))
- mejoras en el mensaje de error de SQL ([adc6908](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/adc690818db5d4d9d14c728643cf09ddf6fa7e8c))
- mensajes de casbin guards actualizados ([f863b64](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f863b64135b2fa4f145562081516a6c615eaf79d))
- se adicionó el alias dev para ejecutar el comando "npm run start:dev:sql" ([422b4e4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/422b4e4d12ab21be314d5dcc88eca9cbc35da733))
- se completan los test faltantes para buscarPorId en usuarioService ([979baf2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/979baf267d8164fe2ea4d0e5b9924da23003222a))

### Bug Fixes

- agregado nuevo ClientId y ClientSecret en nuevo entorno de AGCS ([54776dd](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/54776dd70a345c21cd83a9b2e7aff6db7cda8ee4))
- controlando respuesta datos.errores y cambios en base-external-service ([c14d0eb](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c14d0eb2ae2be38e0ea141ec37c863ac5df66588))
- corrección en actualización de datos al crear o validar usuario OIDC ([05c8afd](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/05c8afdd65605907790b67a9cca480f8da80ca2d))
- corrección en envio de correos de restablecimiento de contraseña ([47bdb98](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/47bdb989eb175e350b61061e3e8641776e7fba75))
- mejoras en la validación OIDC y correcciones cuando se utiliza logger en las migraciones ([dff2a49](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/dff2a491bc48ea3537b3bfc7ac06185510628b5f))
- modificada documentación mencionando que sacar un fork ya no es necesario 🤦‍♂️ ([5d54f82](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/5d54f82c9a32e401d571dd38deb981a03f389853))
- parse fecha con formato ISO para los logs de las consultas ([fd79986](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/fd79986ccc9078fe546d56f38df0bc4c7341d802))

### [1.6.1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.6.0...v1.6.1) (2022-10-01)

### Features

- añadido servicio que reenvia el correo de activación para usuarios con cuenta sin verificación para rol administrador ([bd584a3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/bd584a3b78e3334b4f3882e2421eb3e8ea1f7899))
- se agregó el validador de tipos enumerados buildCheck ([6e2a1c4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6e2a1c4f3f66c87139888579e96d3758c89c9c52))

### Bug Fixes

- corregido método que crea usuarios con Ciudadanía Digital con rol usuario por defecto, logs de correos fallidos, refactor de validarOCrearUsuarioOidc ([2fb1ac1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2fb1ac122ef2a53c5eb510aedae3a29533ea4fae))
- corregidos repositorios de actualización de datos de activación y recuperación de cuenta ([3a8db8c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3a8db8c617e4c11a271c01edd6f93bf7487afbab))
- modificadas funciones de repositorio de usuario para usar update en lugar de save, dado que TypeOrm soporta ambas ([2fd90cc](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2fd90cc5124b9eb6f5c87e32ab02410ddd79429c))
- modificados métodos de usuario.service que usaban if's anidados, varias optimizaciones de código ([1a7070c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/1a7070c1ff8786f4ce48f60b72b2dfb7e4ce85a9))
- respuesta del refresh token ([6eb6eaf](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6eb6eaf5938885388745ebdf947ae490e694aff1))

## [1.6.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.5.0...v1.6.0) (2022-09-26)

### Features

- :sparkles: validación global de parámetros adicionado ([496a222](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/496a22235349d59c217be218dc08d15b9986b347))
- actualización de dependencias Nest 9.1.1 ([b32b66e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b32b66e178c1b5cbfec66488efafb75277683e38))
- actualizando servicios y controladores con BaseService y BaseController ([48ca6f0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/48ca6f07281b2a2e1175378050ec8c48c7bc0c93))
- adicionando id del usuario autenticado a reqId ([56ebae0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/56ebae04a0dc913bac6568ba3537fd4522161660))
- adicionando transacción a crear usuario ([a6545be](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a6545be39c73894373bc818ebba97868e611d6dd))
- adicionando validaciones para dto ([75256df](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/75256df4efc53af785da05641efa950833e2526d))
- buildCheck adicionado para validar estados ([0aa29e5](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/0aa29e5147295b91b86b456c39821cb8f4056098))
- cambios en la forma de instanciar logger ([cea5ad0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/cea5ad0aae73630891b5fd11a0ae81e1f177e565))
- clase BaseExternalService adicionado para instanciar los servicios externos ([902aef5](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/902aef5c74539c1102a0d9cca09ea5418b829bb5))
- desactivando logs de JWTGuard ([c6f0a7c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c6f0a7c4813a6fdd127a004bd53fc7536173c39f))
- incorporación de transaccion por defecto ([afe8219](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/afe8219b889043537909565d38510b7dc2a07d3e))
- ip address adicionado al log de inicio de la aplicación ([d2faeeb](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d2faeebe73ab9ef65af90a42fd65aa751d4e60ca))
- logger module actualizado ([146d16f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/146d16f07eb7eb1c4d0f3827e9e19fa52c9861cb))
- loggerService adicionado a OidcStrategy del módulo de autenticación ([d151610](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d1516106dc85b71c6d468f94c67f6ba8e6f1c147))
- mejoras en logo nest ([9ce9e76](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9ce9e763abe64df6b9f82521e833160caf0ba0c1))
- mejoras en los mensajes de error de los metodos de autenticación ([644a7e7](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/644a7e7ddc94be5d84748765067a28b465bd0895))
- merge con feature/log-files ([bba7883](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/bba78831ff7cf52c0517a059fbe5024d8c8bd56c))
- normalizando modelos con el campo \_estado ([269aa71](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/269aa7111332450d1ed73f241d6187efbd5a1f22))
- parámetro LOG_LEVEL adicionado a las variables de entorno ([2201cc2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2201cc23d21101293e2d80acf4896f5a2ef0e2f4))
- redact path adicionado para ocultar información sensible en la consola ([bd955aa](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/bd955aa9f48e3778eead97830ca5253c09f2f66c))
- regla de eslint eqeqeq adicionado ([7cad55e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/7cad55e7520387dcaea09d80060735151e7c908b))
- resolviendo conflictos del merge con develop ([a7e3a31](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/a7e3a31b203e399c9121114900843bbc1f71247b))
- se adicionó la impresión de rutas en el cargado de la aplicación ([391df10](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/391df1014baac00a851089c55208d9a8eba3ed23))
- se cambió la forma de instanciar logger ([f89f691](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/f89f69171fb54b8109038b061033bc62318a2bee))
- servicio estado actualizado con más información ([38e221e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/38e221ee138a8390084c8e6183fa7ba9db3d086b))
- servicio SIN actualizado con BaseExternalService ([c0878fc](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c0878fc41d059c2cbf5fc770dc2b7f36e948727a))
- timestamp adicionado para los logs de la consola ([028480a](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/028480a3b7c66b046086a38e12d60867c02d1223))

### Bug Fixes

- ajuste de lint para seeder de parámetros e importacionies de logger ([7c8d408](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/7c8d40814498efb33612baa839c4af3d9c13a412))
- añadido campo \_usuarioCreación a repositorios de parámetros, módulos y usuario; nuevo DTO IsNumberString ([ca60c48](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ca60c48f072dfad960fe4faf9db3b7cb784e60d7))
- cambio de nombre variable paramsIdDto ([cc9879d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/cc9879dd0795a57909aeee21e3ffd70d40fbcab2))
- cambios en ExternalServiceException para el registro de logs ([d041020](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d041020fe8b85b864cf58a27ec44efc3cd6d5201))
- cargado de las variables de entorno para LoggerConfig ([0e8b783](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/0e8b7839c9f31a17692a65efc519b53bf32952a7))
- corrección en interpretación de formato fecha de persona ([baaa341](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/baaa341d2e36bbe341aaf44a647b1e1f36991f1f))
- corrección en los seeders de usuario ([c40c93e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/c40c93e67fcd971c110094dd30fa11df5fd1b09f))
- corrección en validación de fidModulo nulo para creación de secciones ([efe20a1](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/efe20a1cb39af8ca1b88a4fa8b6d8c009df5e2ec))
- corrección en validación de oidc strategy para formato de user info con scope profile ([0f5b2fb](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/0f5b2fb954d97c92aab6846b7d2c8a1139cb5e21))
- creación automática de la carpeta de logs ([d754b00](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d754b004de00aa23b390c754dda8a5e961bcde76))
- eliminación de pipe validacion en controladores, corrección de path de class-validator ([2301f2d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2301f2d1501d885defb56319993ccf7430ca22fb))
- los usuarios creados por administrador tienen estado "ACTIVO" por defecto ([01a7c52](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/01a7c52b6d063d4036bfb09c8a79dd073fa08140))
- manejo de errores en el envio de correos ([9262bc4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/9262bc4b691e71402e9a3352f64fac19800ac027))
- modificadas instancias condicionales anidadas, para evitar anidación de condicionales ([22a146e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/22a146e719be9cc7ab1b064778c26e91760d4487))
- obtener appName y appVersion para el modo producción ([6c04f47](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/6c04f47c8ec5b587996a869862ee3ed76d345dad))
- print logo ([8d666f8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8d666f8e001f9c33a8c91d929e63218e6cfd9393))
- resuelto el error al imprimir objetos por la consola ([284c0be](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/284c0bee61790dcedebd46a4ca6926fc6a6c57fe))
- sample para crear scripts ([330503b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/330503b10164ee8f17cbd8dfe321e5f7548f0667))
- solucionado la visualización de logs con pm2 ([52de2c4](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/52de2c47cace371ddb18c3e186f3cf3b9690ea9b))

## [1.5.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.3.2...v1.5.0) (2022-08-24)

### Features

- actualización de librerías NestJS 9.0.9 ([b309f4d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b309f4d0b6e91c0ace7c4ec43e0ec3283e64f8c9))
- agregando carpeta de logs por defecto al gitignore ([dd4f28b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/dd4f28b32e3f14dbb14f5473b981330e905b9530))
- agregando variables de entorno a LogService ([ec329ed](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ec329ed2657192746057511bfa1d2b76be102041))
- añadidas API's necesarias para crear y recuperar una cuenta con envio de correos ([d2708a3](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d2708a3c994ec2e8f57410f8f58eb2dfe60dfd9f))
- añadido flujo de activación de cuenta, con envio de correo y ajustes menores de logs ([3412178](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/3412178cd23eb77d870988a4b70b1903da9dfc4f))
- añadido PinnoLogger para el contexto de cada controlador, corregidos test de logs y propiedad req ([e20a197](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e20a197f0d22dc757a82b16fb521a8012cb4e195))
- ficheros de log actualizados ([e587dfb](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/e587dfb5368ed22e4a28451a6adec6418ac520eb))
- mejoras en los mensajes de log para el modo desarrollo ([0b3721f](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/0b3721f2169eac3994b6f10e10835f25739f5a5c))
- se agregó morgan para logs de desarrollo ([b6ddb4e](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b6ddb4e2d50e72587786bdec547b9b4910cc72a1))

### Bug Fixes

- corrección en paginado para API's de parámetros, módulos y usuarios ([2c6e5d8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2c6e5d8f397f4812027f673b3f9b0eca46ccbc76))
- filtros de politicas ([ae277eb](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ae277eb99181f26a35afd17f5039773a105f1877))
- log de todas las rutas registradas ([5940712](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/5940712b4181cbe066c5deed20ef729b190daa96))
- log en modo producción ([8c5f155](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/8c5f15571f3635018591af26374afccc4300b88e))
- log service test ([66bad15](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/66bad157f44a366880c8563a6de436262e7c9219))
- mejoras en la configuración de logs ([0ed8568](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/0ed85682cb41495250544817488d28f1b7228f0a))
- mensajes de error para errores personalizados ([1867dd7](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/1867dd72768c15b2206f1633056887f98645fb29))
- modificado registro de cuenta con datos del usuario sin datos personales y tipos de dato fecha ([76c39a0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/76c39a01938f3703f32716d68f5925ece764de46))

## [1.4.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.3.2...v1.4.0) (2022-08-15)

### Features

- actualización de librerías NestJS 9.0.9 ([b309f4d](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/b309f4d0b6e91c0ace7c4ec43e0ec3283e64f8c9))

### Bug Fixes

- corrección en paginado para API's de parámetros, módulos y usuarios ([2c6e5d8](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/2c6e5d8f397f4812027f673b3f9b0eca46ccbc76))

### [1.3.2](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.3.0...v1.3.2) (2022-08-07)

### Bug Fixes

- actualización de dependencias NestJS 9.0.7 ([dccd447](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/dccd4479e2fd422281cb8ec8c5cb190f894d43fc))
- actualización de manual, mencionando la creación de esquemas ([107d921](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/107d921abe522881c2a0b0ea1f126d1cf2a9d33a))
- añadido tipado en transacción para restaurar contraseña ([d3b836b](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d3b836b35bd822a60c34b1dc5ee531ecd62a07e4))
- modificadas instancias condicionales anidadas, para evitar anidación de condicionales ([ad75c94](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/ad75c94a1bb236fe4c9aeb6605eb585d89c7f4de))

## [1.3.0](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/compare/v1.2.0...v1.3.0) (2022-07-31)

### Features

- añadido filtro para secciones en API en módulos ([92e3816](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/92e3816eaad63fe1eb5dcfd7ac31447bfc7c4657))

### Bug Fixes

- :wrench: Ajustes en actualizacion de un modulo ([516b147](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/516b1473da0d260e2fa500ead719f52a8bc6d94a))
- :wrench: Ajustes en creacion de modulos ([d3f5b24](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/d3f5b24356c864399de34b9ba21d8f6992766861))
- correcciones de ortografía y versión de @types/pdfmake ([def332c](https://gitlab.agetic.gob.bo/agetic/agetic/proyectos-base/agetic-nestjs-base-backend/commit/def332ca0c23541609e2546b67322116cd42d2b9))

## [1.2.0](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/compare/v1.1.6...v1.2.0) (2022-07-26)

### Features

- removiendo paquete requerido pm2 ([f7829cf](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/f7829cfcc7c4f2efd0df03cfa765af6a94fda3a3))
- respuesta this.success adicionado para responder desde el crontrolador ([42f262b](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/42f262be0f9be1ead218d448b187901ba29a8aa0))
- versión actualizada en package-lock.json ([326621a](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/326621a5fa0805303379527a5b594ef0338d1acd))

### Bug Fixes

- añadidas API para activar/inactivar módulos con permisos y ajuste en API de perfil para módulos activos ([eb3c607](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/eb3c60708e20fcf09bd9c74342b10f6fe29eab8e))
- cambio columna tipo enum por varchar ([9f7af7f](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/9f7af7f87b2416480b502cf9b83b2d90e0f86834))
- **ci:** comando para inicio ([e95e567](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/e95e5672e5fbdbda3d349ed00e09de032ac0a791))
- **ci:** copy default index.ts.sample ([2ff6f8e](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/2ff6f8e833ba929451efdfae16bc4a8868183ad8))
- **ci:** correcciones para cicd ([c0d66e5](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/c0d66e5296b6862a005fe46b327b025c00e2751b))
- **ci:** legacy-peer-deps ([91c5403](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/91c54035aec056c03099fe1966ff73e1b506adad))
- **ci:** obtener desde vault el nombre de chart ([6e5339e](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/6e5339ebcc0d7bdd0ba42ed65ad5e675e302ec8f))
- **ci:** permitir copia node_modules en pipeline ([0f81b1f](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/0f81b1fde0366bbb90d2597106aa70972b9f71e3))
- corrección de parámetros de paginado para API de modulos, actualización de dependencias ([b94dfc7](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/b94dfc77d6e9af996ad288457bcb2c1799a1111b))
- corrección en filtro de rutas con submodulos ([2d6531e](https://gitlab.agetic.gob.bo/agetic/backend-base-nestjs/commit/2d6531e1a4e17000b67f6f5163ee2dff27543931))
