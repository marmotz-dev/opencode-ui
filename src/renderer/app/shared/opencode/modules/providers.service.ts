import { effect, inject, Injectable, signal } from '@angular/core'
import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { Model, ProviderData } from '../opencode.types'

@Injectable({
  providedIn: 'root',
})
export class ProvidersService {
  private logger = new Logger(ProvidersService.name)
  private opencodeApi = inject(OpencodeApiService)

  private readonly _providers = signal<ProviderData | null>(null)
  public providers = this._providers.asReadonly()

  lastChosenPromptModel = signal<Model | null>(null)
  private _nextPromptModel = signal<Model | null>(null)
  public nextPromptModel = this._nextPromptModel.asReadonly()

  private _modelSelectorVisible = signal<boolean>(false)
  public modelSelectorVisible = this._modelSelectorVisible.asReadonly()

  constructor() {
    effect(() => this.loadProviders())
  }

  async loadProviders() {
    const response = await this.opencodeApi.getProviders()
    const providers = response.data ?? ({} as ProviderData)

    this.logger.debug('loadProviders', providers)

    this._providers.set(providers)

    return providers
  }

  getProviderByIds(providerId: string, modelId: string): Model | null {
    const provider = this.providers()?.providers.find((provider) => provider.id === providerId)
    if (!provider) {
      return null
    }

    const model = provider.models[modelId]
    if (!model) {
      return null
    }

    return {
      providerID: provider.id,
      providerName: provider.name,
      modelID: model.id,
      modelName: model.name,
    }
  }

  setNextPromptModel(model: Model) {
    this._nextPromptModel.set(model)
    this.lastChosenPromptModel.set(model)
  }

  openModelSelector() {
    this._modelSelectorVisible.set(true)
  }

  closeModelSelector() {
    this._modelSelectorVisible.set(false)
  }
}
