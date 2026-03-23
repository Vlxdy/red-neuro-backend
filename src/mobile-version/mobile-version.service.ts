import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EstadoMobileDto } from '@/dto/app.dto'

type MobilePlatform = 'android' | 'ios'
type MobileStatus = 'required' | 'recommended' | 'ok'

@Injectable()
export class MobileVersionService {
  constructor(private readonly configService: ConfigService) {}

  evaluarVersion(
    platform?: MobilePlatform,
    currentVersion?: string,
    build?: string
  ): EstadoMobileDto | null {
    if (!platform || !currentVersion) {
      return null
    }

    const minVersion = this.configService.get<string>(
      `MOBILE_${platform.toUpperCase()}_MIN_VERSION`
    )
    const stableVersion = this.configService.get<string>(
      `MOBILE_${platform.toUpperCase()}_STABLE_VERSION`
    )
    const storeUrl = this.configService.get<string>(
      `MOBILE_${platform.toUpperCase()}_STORE_URL`
    )

    if (!minVersion || !stableVersion) {
      return {
        enabled: false,
        platform,
        currentVersion,
        currentBuild: build || null,
        minVersion: minVersion || null,
        stableVersion: stableVersion || null,
        status: null,
        forceUpdate: null,
        shouldUpdate: null,
        storeUrl: storeUrl || null,
        title: null,
        message: null,
      }
    }

    const status = this.resolveStatus(currentVersion, minVersion, stableVersion)
    const forceUpdate = status === 'required'
    const shouldUpdate = status !== 'ok'

    return {
      enabled: true,
      platform,
      currentVersion,
      currentBuild: build || null,
      minVersion,
      stableVersion,
      status,
      forceUpdate,
      shouldUpdate,
      storeUrl: storeUrl || null,
      title: this.buildTitle(status),
      message: this.buildMessage(status),
    }
  }

  private resolveStatus(
    currentVersion: string,
    minVersion: string,
    stableVersion: string
  ): MobileStatus {
    if (this.compareVersions(currentVersion, minVersion) < 0) {
      return 'required'
    }

    if (this.compareVersions(currentVersion, stableVersion) < 0) {
      return 'recommended'
    }

    return 'ok'
  }

  private compareVersions(left: string, right: string): number {
    const leftParts = this.normalizeVersion(left)
    const rightParts = this.normalizeVersion(right)

    for (
      let index = 0;
      index < Math.max(leftParts.length, rightParts.length);
      index += 1
    ) {
      const leftValue = leftParts[index] ?? 0
      const rightValue = rightParts[index] ?? 0

      if (leftValue > rightValue) return 1
      if (leftValue < rightValue) return -1
    }

    return 0
  }

  private normalizeVersion(version: string): number[] {
    return version.split('.').map((value) => Number(value))
  }

  private buildTitle(status: MobileStatus): string | null {
    if (status === 'required') {
      return 'Actualización requerida'
    }

    if (status === 'recommended') {
      return 'Nueva versión disponible'
    }

    return null
  }

  private buildMessage(status: MobileStatus): string | null {
    if (status === 'required') {
      return 'Debes actualizar la aplicación para continuar usando el servicio.'
    }

    if (status === 'recommended') {
      return 'Te recomendamos actualizar a la versión más estable de la aplicación.'
    }

    return null
  }
}
