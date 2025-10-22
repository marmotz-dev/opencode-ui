import { computed, effect, inject, Injectable, signal } from '@angular/core'
import {
  Event,
  EventMessagePartRemoved,
  EventMessagePartUpdated,
  EventMessageRemoved,
  EventMessageUpdated,
  EventSessionDeleted,
  EventSessionUpdated,
  Session,
} from '@opencode-ai/sdk/client'
import { Logger } from '../logger/logger.service'
import { OpencodeApiService } from './opencode-api.service'
import { SessionMessage } from './opencode.types'

@Injectable({
  providedIn: 'root',
})
export class OpencodeChatService {
  readonly sessionId = signal<string | null>(null)
  private logger = new Logger(OpencodeChatService.name)
  private opencodeApi = inject(OpencodeApiService)
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

  constructor() {
    effect(async () => this.loadSessionsEffect())
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

  async createSession(): Promise<Session | undefined> {
    const response = await this.opencodeApi.createSession()

    const newSession = response.data

    this.logger.debug('OpencodeChatService.createSession', { newSession })

    this._sessions.update((sessions) => {
      if (sessions) {
        if (newSession) {
          return [newSession, ...sessions]
        }

        return sessions
      }

      if (newSession) {
        return [newSession]
      }

      return null
    })

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

      this.sessionId.set(newSessionId)

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

    this._sessions.set(response.data ?? [])
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

    this.opencodeApi.prompt(sessionId, message).then((response) => {
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

  private async loadSessionsEffect() {
    await this.loadSessions()
    this.logger.debug('OpencodeChatService.effect.loadSessions', { sessions: this.sessions() })
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
      this.sessionId.set(null)
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
}
