import { Injectable } from '@nestjs/common'
import { PersonalMedicoRepository } from '../repository/personal-medico.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { formatearPersonales } from '../utils/formateo-personal.utils'

@Injectable()
export class PersonalMedicoService {
  constructor(
    private readonly personalMedicoRepository: PersonalMedicoRepository
  ) {}

  async listarPersonalMedico(paginacionQuery: PaginacionQueryDto) {
    const [personal, total] =
      await this.personalMedicoRepository.listarPersonalMedicoPaginado(
        paginacionQuery
      )

    return [formatearPersonales(personal), total] as const
  }
}
