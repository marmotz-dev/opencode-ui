import { computed, effect, inject, Injectable, signal } from '@angular/core'
import {
  AssistantMessage,
  Event,
  EventMessagePartRemoved,
  EventMessagePartUpdated,
  EventMessageRemoved,
  EventMessageUpdated,
  EventSessionDeleted,
} from '@opencode-ai/sdk/client'
import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { Model, SessionMessage } from '../opencode.types'
import { ProvidersService } from './providers.service'
import { SessionsService } from './sessions.service'

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private logger = new Logger(MessagesService.name)
  private opencodeApi = inject(OpencodeApiService)
  private providersService = inject(ProvidersService)
  private sessionsService = inject(SessionsService)

  private _sessionsMessages = signal<Record<string, SessionMessage[]>>({})
  public sessionsMessages = this._sessionsMessages.asReadonly()

  readonly sessionMessages = computed(() => {
    const sessionsMessages = this.sessionsMessages()
    const sessionId = this.sessionsService.sessionId()

    this.logger.debug('computed.sessionMessages', { sessionsMessages, sessionId })

    if (sessionId) {
      return sessionsMessages[sessionId] ?? null
    }

    return null
  })

  readonly currentModel = computed<Model | null>(() => {
    const nextPromptModel = this.providersService.nextPromptModel()
    const lastChosenPromptModel = this.providersService.lastChosenPromptModel()
    let messages = this.sessionMessages()
    const sessionsMessages = this.sessionsMessages()
    this.providersService.providers()

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
        return this.providersService.getProviderByIds(lastChosenPromptModel.providerID, lastChosenPromptModel.modelID)
      }
    } else {
      const info = lastMessage.info as AssistantMessage

      const provider = this.providersService.getProviderByIds(info.providerID, info.modelID)
      if (provider) {
        return provider
      }
    }

    return this.getDefaultModel()
  })

  getDefaultModel() {
    const providers = this.providersService.providers()
    if (!providers) {
      return null
    }

    for (const providerId in providers.default) {
      const provider = this.providersService.getProviderByIds(providerId, providers.default[providerId])
      if (provider) {
        return provider
      }
    }

    return null
  }

  constructor() {
    effect(() => this.loadSessionMessagesEffect())

    this.opencodeApi.onEvent('message.updated', (event: Event) => this.onMessageUpdated(event as EventMessageUpdated))
    this.opencodeApi.onEvent('message.removed', (event: Event) => this.onMessageRemoved(event as EventMessageRemoved))

    this.opencodeApi.onEvent('message.part.updated', (event: Event) =>
      this.onMessagePartUpdated(event as EventMessagePartUpdated)
    )
    this.opencodeApi.onEvent('message.part.removed', (event: Event) =>
      this.onMessagePartRemoved(event as EventMessagePartRemoved)
    )

    this.opencodeApi.onEvent('session.deleted', (event: Event) => this.onSessionDeleted(event as EventSessionDeleted))
  }

  async onSessionDeleted(event: EventSessionDeleted) {
    this.logger.debug('onSessionDeleted', event)
    const sessionId = event.properties.info.id

    this.removeSessionMessages(sessionId)
  }

  async loadSessionMessages() {
    const sessionId = this.sessionsService.sessionId()

    if (sessionId) {
      const response = await this.opencodeApi.getSessionMessages(sessionId)

      this._sessionsMessages.update((sessionsMessages) => ({
        ...sessionsMessages,
        [sessionId]: response.data ?? [],
      }))

      this.logger.debug('loadSessionMessages', {
        sessionId,
        sessionMessages: response.data ?? [],
      })
    }
  }

  async prompt(message: string) {
    let sessionId = this.sessionsService.sessionId()

    this.logger.debug('prompt', { message, sessionId })

    if (!sessionId) {
      const session = await this.sessionsService.createSession()

      if (!session) {
        throw new Error('Unable to create session')
      }

      sessionId = session.id

      this.logger.debug('prompt.createSession', { message, sessionId })
    }

    const model = this.currentModel()

    this.opencodeApi.prompt(sessionId, message, model).then((response) => {
      this.logger.debug('prompt.response', { message, sessionId, response })
    })
  }

  removeSessionMessages(sessionId: string) {
    this._sessionsMessages.update((sessionsMessages) => {
      delete sessionsMessages[sessionId]

      return { ...sessionsMessages }
    })
  }

  private async loadSessionMessagesEffect() {
    const sessionId = this.sessionsService.sessionId()
    this.logger.debug('effect.loadSessionMessages', sessionId)

    if (sessionId) {
      await this.loadSessionMessages()
    }
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
}
