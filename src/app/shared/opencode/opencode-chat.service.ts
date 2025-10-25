import { computed, effect, inject, Injectable, signal } from '@angular/core'
import {
  Agent,
  AssistantMessage,
  Config,
  Event,
  EventMessagePartRemoved,
  EventMessagePartUpdated,
  EventMessageRemoved,
  EventMessageUpdated,
  EventSessionDeleted,
  EventSessionUpdated,
  Project,
  Session,
} from '@opencode-ai/sdk/client'
import { Logger } from '../logger/logger.service'
import { OpencodeApiService } from './opencode-api.service'
import { Model, ProviderData, SessionMessage } from './opencode.types'

@Injectable({
  providedIn: 'root',
})
export class OpencodeChatService {
  private logger = new Logger(OpencodeChatService.name)
  private opencodeApi = inject(OpencodeApiService)

  readonly _agents = signal<Agent[] | null>(null)
  public agents = this._agents.asReadonly()

  readonly _config = signal<Config | null>(null)
  public config = this._config.asReadonly()

  readonly _providers = signal<ProviderData | null>(null)
  public providers = this._providers.asReadonly()

  readonly _projects = signal<Project[] | null>(null)
  public projects = this._projects.asReadonly()

  readonly _currentProject = signal<Project | null>(null)
  public currentProject = this._currentProject.asReadonly()

  private readonly _sessionId = signal<string | null>(null)
  public sessionId = this._sessionId.asReadonly()

  private _sessions = signal<Session[] | null>(null)
  public sessions = this._sessions.asReadonly()
  readonly session = computed(() => {
    const sessionId = this.sessionId()
    const sessions = this.sessions()

    if (sessions) {
      const session = sessions.find((session) => session.id === sessionId)

      if (session) {
        return session
      }
    }

    return null
  })

  private _sessionsMessages = signal<Record<string, SessionMessage[]>>({})
  public sessionsMessages = this._sessionsMessages.asReadonly()
  readonly sessionMessages = computed(() => {
    const sessionsMessages = this.sessionsMessages()
    const sessionId = this.sessionId()

    this.logger.debug('OpencodeChatService.computed.sessionMessages', { sessionsMessages, sessionId })

    if (sessionId) {
      return sessionsMessages[sessionId] ?? null
    }

    return null
  })

  private lastChosenPromptModel = signal<Model | null>(null)
  private _nextPromptModel = signal<Model | null>(null)
  public nextPromptModel = this._nextPromptModel.asReadonly()

  readonly currentModel = computed<Model | null>(() => {
    const nextPromptModel = this.nextPromptModel()
    const lastChosenPromptModel = this.lastChosenPromptModel()
    let messages = this.sessionMessages()
    const sessionsMessages = this.sessionsMessages()
    const providers = this.providers()

    if (nextPromptModel) {
      return nextPromptModel
    }

    if (!messages || messages.length === 0) {
      messages = []

      for (const sessionId in sessionsMessages) {
        messages = messages.concat(sessionsMessages[sessionId])
      }

      messages?.sort((m1, m2) => m1.info.time.created - m2.info.time.created)
    }

    const lastMessage = messages.filter((sessionMessage) => sessionMessage.info.role === 'assistant').pop()
    if (!lastMessage) {
      if (lastChosenPromptModel) {
        return this.getProviderByIds(lastChosenPromptModel.providerID, lastChosenPromptModel.modelID)
      }

      if (!providers) {
        return null
      }

      const providerData = Object.entries(providers?.default).shift()

      if (!providerData) {
        return null
      }

      return this.getProviderByIds(...providerData)
    }

    const info = lastMessage.info as AssistantMessage

    return this.getProviderByIds(info.providerID, info.modelID)
  })

  setSessionId(sessionId: string | null) {
    if (sessionId !== this.sessionId()) {
      this._sessionId.set(sessionId)
      this._nextPromptModel.set(null)
    }
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

  private _modelSelectorVisible = signal<boolean>(false)
  public modelSelectorVisible = this._modelSelectorVisible.asReadonly()

  constructor() {
    effect(async () => this.initEffect())
    effect(async () => this.loadSessionMessagesEffect())

    this.opencodeApi.onEvent('session.updated', (event: Event) => this.onSessionUpdated(event as EventSessionUpdated))
    this.opencodeApi.onEvent('session.deleted', (event: Event) => this.onSessionDeleted(event as EventSessionDeleted))

    this.opencodeApi.onEvent('message.updated', (event: Event) => this.onMessageUpdated(event as EventMessageUpdated))
    this.opencodeApi.onEvent('message.removed', (event: Event) => this.onMessageRemoved(event as EventMessageRemoved))

    this.opencodeApi.onEvent('message.part.updated', (event: Event) =>
      this.onMessagePartUpdated(event as EventMessagePartUpdated)
    )
    this.opencodeApi.onEvent('message.part.removed', (event: Event) =>
      this.onMessagePartRemoved(event as EventMessagePartRemoved)
    )
  }

  setNextPromptModel(model: Model) {
    this._nextPromptModel.set(model)
    this.lastChosenPromptModel.set(model)
  }

  async createSession(): Promise<Session | undefined> {
    const response = await this.opencodeApi.createSession()

    const newSession = response.data

    this.logger.debug('OpencodeChatService.createSession', { newSession })

    return newSession
  }

  async deleteSession(sessionId: string) {
    this.logger.debug('OpencodeChatService.deleteSession', { sessionId })

    await this.opencodeApi.deleteSession(sessionId)

    const sessions = this.sessions()

    const currentIndex = sessions?.findIndex((session) => session.id === sessionId)

    const newSessions = sessions?.filter((session) => session.id !== sessionId) ?? []
    this._sessions.set(newSessions)

    this._sessionsMessages.update((sessionsMessages) => {
      delete sessionsMessages[sessionId]

      return { ...sessionsMessages }
    })

    if (sessionId === this.sessionId()) {
      let newSessionId: string | null = null
      if (currentIndex !== undefined && currentIndex !== -1) {
        if (newSessions[currentIndex] !== undefined) {
          newSessionId = newSessions[currentIndex].id
          this.logger.debug('OpencodeChatService.deleteSession.selectNext', { newSessionId })
        } else if (newSessions[currentIndex - 1] !== undefined) {
          newSessionId = newSessions[currentIndex - 1].id
          this.logger.debug('OpencodeChatService.deleteSession.selectPrevious', { newSessionId })
        } else {
          newSessionId = null
          this.logger.debug('OpencodeChatService.deleteSession.noMoreSection')
        }
      }

      this.setSessionId(newSessionId)

      return newSessionId
    }

    return null
  }

  async loadSessionMessages() {
    const sessionId = this.sessionId()

    if (sessionId) {
      const response = await this.opencodeApi.getSessionMessages(sessionId)

      this._sessionsMessages.update((sessionsMessages) => ({
        ...sessionsMessages,
        [sessionId]: response.data ?? [],
      }))

      this.logger.debug('OpencodeChatService.loadSessionMessages', {
        sessionId,
        sessionMessages: response.data ?? [],
      })
    }
  }

  async loadSessions() {
    const response = await this.opencodeApi.getSessions()
    const sessions = response.data ?? []

    this.logger.debug('loadSessions', sessions)

    this._sessions.set(sessions)
  }

  async loadConfig() {
    const response = await this.opencodeApi.getConfig()
    const config = response.data ?? null

    this.logger.debug('loadConfig', config)

    this._config.set(config)
  }

  async loadAgents() {
    const response = await this.opencodeApi.getAgents()
    const agents = response.data ?? []

    this.logger.debug('loadAgents', agents)

    this._agents.set(agents)
  }

  async loadProjects() {
    const response = await this.opencodeApi.getProjects()
    const projects = response.data ?? []

    this.logger.debug('loadProjects', projects)

    this._projects.set(projects)
  }

  async loadCurrentProject() {
    const response = await this.opencodeApi.getCurrentProject()
    const currentProject = response.data ?? null

    this.logger.debug('loadCurrentProject', currentProject)

    this._currentProject.set(currentProject)
  }

  async loadProviders() {
    const response = await this.opencodeApi.getProviders()
    const providers = response.data ?? ({} as ProviderData)

    this.logger.debug('loadProviders', providers)

    this._providers.set(providers)

    return providers
  }

  async prompt(message: string) {
    let sessionId = this.sessionId()

    this.logger.debug('OpencodeChatService.prompt', { message, sessionId })

    if (!sessionId) {
      const session = await this.createSession()

      if (!session) {
        throw new Error('Unable to create session')
      }

      sessionId = session.id

      this.logger.debug('OpencodeChatService.prompt.createSession', { message, sessionId })
    }

    const model = this.currentModel()
    this.opencodeApi.prompt(sessionId, message, model).then((response) => {
      this.logger.debug('OpencodeChatService.prompt.response', { message, sessionId, response })
    })
  }

  private async loadSessionMessagesEffect() {
    const sessionId = this.sessionId()
    this.logger.debug('OpencodeChatService.effect.loadSessionMessages', sessionId)

    if (sessionId) {
      await this.loadSessionMessages()
    }
  }

  private async initEffect() {
    await this.loadSessions()
    await this.loadConfig()
    await this.loadProviders()
    await this.loadAgents()
    await this.loadProjects()
    await this.loadCurrentProject()
  }

  private onMessagePartRemoved(event: EventMessagePartRemoved) {
    this._sessionsMessages.update((sessionsMessages) => {
      const sessionId = event.properties.sessionID
      const sessionMessages = sessionsMessages[sessionId]
      if (!sessionMessages) {
        return sessionsMessages
      }

      const messageId = event.properties.messageID
      const messageIndex = sessionMessages.findIndex((message) => message.info.id === messageId)
      if (messageIndex === -1) {
        return sessionsMessages
      }

      const partId = event.properties.partID
      sessionMessages[messageIndex].parts = sessionMessages[messageIndex].parts.filter((part) => part.id !== partId)

      return { ...sessionsMessages }
    })
  }

  private onMessagePartUpdated(event: EventMessagePartUpdated) {
    this._sessionsMessages.update((sessionsMessages) => {
      const sessionId = event.properties.part.sessionID
      const sessionMessages = sessionsMessages[sessionId]
      if (!sessionMessages) {
        return sessionsMessages
      }

      const messageId = event.properties.part.messageID
      const messageIndex = sessionMessages.findIndex((message) => message.info.id === messageId)
      if (messageIndex === -1) {
        return sessionsMessages
      } else {
        const partId = event.properties.part.id
        const partIndex = sessionMessages[messageIndex].parts.findIndex((part) => part.id === partId)

        if (partIndex === -1) {
          sessionMessages[messageIndex].parts.push(event.properties.part)
        } else {
          sessionMessages[messageIndex].parts[partIndex] = event.properties.part
        }
      }

      return { ...sessionsMessages }
    })
  }

  private onMessageRemoved(event: EventMessageRemoved) {
    this._sessionsMessages.update((sessionsMessages) => {
      const sessionId = event.properties.sessionID
      const sessionMessages = sessionsMessages[sessionId]
      if (!sessionMessages) {
        return sessionsMessages
      }

      const messageId = event.properties.messageID

      sessionsMessages[sessionId] = sessionMessages.filter((message) => message.info.id !== messageId)

      return { ...sessionsMessages }
    })
  }

  private onMessageUpdated(event: EventMessageUpdated) {
    this._sessionsMessages.update((sessionsMessages) => {
      const sessionId = event.properties.info.sessionID
      const sessionMessages = sessionsMessages[sessionId]
      if (!sessionMessages) {
        return sessionsMessages
      }

      const messageId = event.properties.info.id
      const messageIndex = sessionMessages.findIndex((message) => message.info.id === messageId)
      if (messageIndex === -1) {
        sessionMessages.push({
          info: event.properties.info,
          parts: [],
        })
      } else {
        sessionMessages[messageIndex] = {
          ...sessionMessages[messageIndex],
          info: event.properties.info,
        }
      }

      sessionsMessages[sessionId] = [...sessionMessages]

      return { ...sessionsMessages }
    })
  }

  private onSessionDeleted(event: EventSessionDeleted) {
    const sessionId = event.properties.info.id

    this._sessions.update((sessions) => {
      if (!sessions) {
        return sessions
      }

      const newSessions = sessions.filter((session) => session.id !== sessionId)

      return [...newSessions]
    })

    this._sessionsMessages.update((sessionsMessages) => {
      delete sessionsMessages[sessionId]

      return { ...sessionsMessages }
    })

    if (this.sessionId() === sessionId) {
      this.setSessionId(null)
    }
  }

  private onSessionUpdated(event: EventSessionUpdated) {
    this._sessions.update((sessions) => {
      if (!sessions) {
        sessions = []
      }

      const sessionId = event.properties.info.id
      const sessionIndex = sessions?.findIndex((session) => session.id === sessionId)
      if (sessionIndex === -1) {
        sessions.unshift(event.properties.info)
      } else {
        sessions[sessionIndex] = event.properties.info
      }

      return [...sessions]
    })
  }

  openModelSelector() {
    this._modelSelectorVisible.set(true)
  }

  closeModelSelector() {
    this._modelSelectorVisible.set(false)
  }
}
