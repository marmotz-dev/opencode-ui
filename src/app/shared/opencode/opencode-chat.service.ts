import { computed, effect, inject, Injectable, signal } from '@angular/core'
import { Session } from '@opencode-ai/sdk/client'
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

    this.opencodeApi.onEvents(['session.deleted', 'session.updated'], async () => this.loadSessions())
    this.opencodeApi.onEvents(
      ['message.part.removed', 'message.removed', 'message.updated', 'message.part.updated'],
      async () => this.loadSessionMessages()
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

    this.logger.debug('OpencodeChatService.loadSessionMessages', { sessionId })

    if (sessionId) {
      const response = await this.opencodeApi.getSessionMessages(sessionId)

      this._sessionsMessages.update((sessionsMessages) => ({
        ...sessionsMessages,
        [sessionId]: response.data ?? [],
      }))
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
    this.logger.debug('OpencodeChatService.effect.loadSessions')
    await this.loadSessions()
  }
}
