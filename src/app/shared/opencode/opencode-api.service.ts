import { inject, Injectable } from '@angular/core'
import { Event } from '@opencode-ai/sdk/client'
import { ElectronService } from '../../core/services'
import { Logger } from '../logger/logger.service'
import {
  CreateSessionResponse,
  DeleteSessionResponse,
  GetAgentsResponse,
  GetConfigResponse,
  GetCurrentProjectResponse,
  GetProjectsResponse,
  GetProvidersResponse,
  GetSessionMessagesResponse,
  GetSessionsResponse,
  Model,
  PromptResponse,
} from './opencode.types'

type EventCallback = (event: Event) => void | Promise<void>

@Injectable({
  providedIn: 'root',
})
export class OpencodeApiService {
  private logger = new Logger(OpencodeApiService.name)

  private electronService = inject(ElectronService)
  private eventCallbacks = new Map<Event['type'], EventCallback[]>()

  constructor() {
    this.listenEvents()
  }

  async createSession(): Promise<CreateSessionResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.session.create')
  }

  async deleteSession(id: string): Promise<DeleteSessionResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.session.delete', id)
  }

  async getConfig(): Promise<GetConfigResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.config.get')
  }

  async getProviders(): Promise<GetProvidersResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.providers.get')
  }

  async getSessionMessages(sessionId: string): Promise<GetSessionMessagesResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.session.messages.get-all', sessionId)
  }

  async getSessions(): Promise<GetSessionsResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.session.get-all')
  }

  listenEvents() {
    this.electronService.ipcRenderer.on('opencode.event', (_e, event: Event) => {
      const callbacks = this.eventCallbacks.get(event.type) ?? []
      for (const callback of callbacks) {
        callback(event)
      }

      if (callbacks.length === 0) {
        this.logger.warn('Unhandled opencode event', event)
      }
    })
  }

  onEvent(eventType: Event['type'], callback: EventCallback) {
    const callbacks = this.eventCallbacks.get(eventType) ?? []
    callbacks.push(callback)

    this.eventCallbacks.set(eventType, callbacks)
  }

  onEvents(eventTypes: Event['type'][], callback: EventCallback) {
    for (const eventType of eventTypes) {
      this.onEvent(eventType, callback)
    }
  }

  async prompt(sessionId: string, message: string, model?: Model | null): Promise<PromptResponse> {
    return this.electronService.ipcRenderer.invoke(
      'opencode.session.prompt',
      sessionId,
      message,
      model
        ? {
            providerID: model.providerID,
            modelID: model.modelID,
          }
        : undefined
    )
  }

  async getAgents(): Promise<GetAgentsResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.agents.get')
  }

  async getProjects(): Promise<GetProjectsResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.project.get-all')
  }

  async getCurrentProject(): Promise<GetCurrentProjectResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.project.get-current')
  }
}
