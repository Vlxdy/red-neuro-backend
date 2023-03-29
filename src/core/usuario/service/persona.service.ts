import { BaseService } from '../../../common/base/base-service'
import { Inject, Injectable } from '@nestjs/common'
import { PersonaRepository } from '../repository/persona.repository'
import { PersonaDto } from '../dto/persona.dto'

@Injectable()
export class PersonaService extends BaseService {
  constructor(
    @Inject(PersonaRepository)
    private personaRepositorio: PersonaRepository
  ) {
    super()
  }

  async buscarPersonaPorCI(persona: PersonaDto) {
    return await this.personaRepositorio.buscarPersonaPorCI(persona)
  }
}
