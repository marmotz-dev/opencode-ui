import { effect, inject, Injectable, signal } from '@angular/core'
import { Config } from '@opencode-ai/sdk/client'
import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private logger = new Logger(ConfigService.name)
  private opencodeApi = inject(OpencodeApiService)

  private readonly _config = signal<Config | null>(null)
  public config = this._config.asReadonly()

  constructor() {
    effect(() => this.loadConfig())
  }

  async loadConfig() {
    const response = await this.opencodeApi.getConfig()
    const config = response.data ?? null

    this.logger.debug('loadConfig', config)

    this._config.set(config)
  }
}
