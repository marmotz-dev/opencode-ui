import { effect, inject, Injectable, signal } from '@angular/core'
import { Agent } from '@opencode-ai/sdk/client'
import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'

@Injectable({
  providedIn: 'root',
})
export class AgentsService {
  private logger = new Logger(AgentsService.name)
  private opencodeApi = inject(OpencodeApiService)

  private readonly _agents = signal<Agent[] | null>(null)
  public agents = this._agents.asReadonly()

  constructor() {
    effect(() => this.loadAgents())
  }

  async loadAgents() {
    const response = await this.opencodeApi.getAgents()
    const agents = response.data ?? []

    this.logger.debug('loadAgents', agents)

    this._agents.set(agents)
  }
}
