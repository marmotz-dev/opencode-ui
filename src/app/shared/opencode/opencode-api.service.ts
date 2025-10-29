import { inject, Injectable } from '@angular/core'
import { Event, Project } from '@opencode-ai/sdk/client'
import { ElectronService } from '../../core/services'
import { Logger } from '../logger/logger.service'
import {
  CreateSessionResponse,
  DeleteSessionResponse,
  GetAgentsResponse,
  GetConfigResponse,
  GetCurrentProjectResponse,
  GetPathResponse,
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
    const response = await this.electronService.ipcRenderer.invoke('opencode.session.create')

    this.logger.debug('createSession', {
      response: response.data,
    })

    return response
  }

  async deleteSession(id: string): Promise<DeleteSessionResponse> {
    const response = await this.electronService.ipcRenderer.invoke('opencode.session.delete', id)

    this.logger.debug('deleteSession', {
      request: { id },
      response: response.data,
    })

    return response
  }

  async getAgents(): Promise<GetAgentsResponse> {
    const response = await this.electronService.ipcRenderer.invoke('opencode.agents.get')

    this.logger.debug('getAgents', {
      response: response.data,
    })

    return response
  }

  async getConfig(): Promise<GetConfigResponse> {
    const response = await this.electronService.ipcRenderer.invoke('opencode.config.get')

    this.logger.debug('getConfig', {
      response: response.data,
    })

    return response
  }

  async getCurrentProject(): Promise<GetCurrentProjectResponse> {
    const response = await this.electronService.ipcRenderer.invoke('opencode.project.get-current')

    this.logger.debug('getCurrentProject', {
      response: response.data,
    })

    return response
  }

  async getPath(): Promise<GetPathResponse> {
    const response = await this.electronService.ipcRenderer.invoke('opencode.path.get')

    this.logger.debug('getPath', {
      response: response.data,
    })

    return response
  }

  async getProjectSessions(project: Project): Promise<GetSessionsResponse> {
    const response = await this.electronService.ipcRenderer.invoke('opencode.project.sessions', project.worktree)

    this.logger.debug('getProjectSessions', {
      request: { projectWorktree: project.worktree },
      response: response.data,
    })

    return response
  }

  async getProjects(): Promise<GetProjectsResponse> {
    const response = await this.electronService.ipcRenderer.invoke('opencode.project.get-all')

    this.logger.debug('getProjects', {
      response: response.data,
    })

    return response
  }

  async getProviders(): Promise<GetProvidersResponse> {
    const response = await this.electronService.ipcRenderer.invoke('opencode.providers.get')

    this.logger.debug('getProviders', {
      response: response.data,
    })

    return response
  }

  async getSessionMessages(sessionId: string): Promise<GetSessionMessagesResponse> {
    const response = await this.electronService.ipcRenderer.invoke('opencode.session.messages.get-all', sessionId)

    this.logger.debug('getSessionMessages', {
      request: { sessionId },
      response: response.data,
    })

    return response
  }

  listenEvents() {
    this.electronService.ipcRenderer.on('opencode.event', (_e, event: Event) => {
      const callbacks = this.eventCallbacks.get(event.type) ?? []

      this.logger.debug('new event', {
        event,
        callbacks: callbacks.length,
      })

      for (const callback of callbacks) {
        callback(event)
      }

      if (callbacks.length === 0) {
        this.logger.warn('Unhandled opencode event', event)
      }
    })
  }

  onEvent(eventType: Event['type'], callback: EventCallback) {
    this.logger.debug('registering event', {
      eventType,
    })

    const callbacks = this.eventCallbacks.get(eventType) ?? []
    callbacks.push(callback)

    this.eventCallbacks.set(eventType, callbacks)
  }

  async prompt(sessionId: string, message: string, model: Model | null): Promise<PromptResponse> {
    const modelData = model
      ? {
          providerID: model.providerID,
          modelID: model.modelID,
        }
      : undefined

    const response = await this.electronService.ipcRenderer.invoke(
      'opencode.session.prompt',
      sessionId,
      message,
      modelData
    )

    this.logger.debug('prompt', {
      request: { sessionId, message, modelData },
      response: response.data,
    })

    return response
  }
}
