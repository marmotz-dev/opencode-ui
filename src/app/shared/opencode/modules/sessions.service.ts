import { computed, effect, inject, Injectable, signal } from '@angular/core'
import { Event, EventSessionDeleted, EventSessionUpdated, Project, Session } from '@opencode-ai/sdk/client'
import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private logger = new Logger(SessionsService.name)
  private opencodeApi = inject(OpencodeApiService)

  private _sessions = signal<Session[] | null>(null)
  public sessions = this._sessions.asReadonly()

  private readonly _sessionId = signal<string | null>(null)
  public sessionId = this._sessionId.asReadonly()

  private readonly currentProject = signal<Project | null>(null)

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

  constructor() {
    effect(() => this.loadSessions())

    this.opencodeApi.onEvent('session.updated', (event: Event) => this.onSessionUpdated(event as EventSessionUpdated))
    this.opencodeApi.onEvent('session.deleted', (event: Event) => this.onSessionDeleted(event as EventSessionDeleted))
  }

  setSessionId(sessionId: string | null) {
    if (sessionId !== this.sessionId()) {
      this._sessionId.set(sessionId)
    }
  }

  async createSession(): Promise<Session | undefined> {
    const response = await this.opencodeApi.createSession()

    const newSession = response.data

    this.logger.debug('SessionsService.createSession', { newSession })

    return newSession
  }

  async deleteSession(sessionId: string) {
    this.logger.debug('SessionsService.deleteSession', { sessionId })

    await this.opencodeApi.deleteSession(sessionId)

    const sessions = this.sessions()

    const currentIndex = sessions?.findIndex((session) => session.id === sessionId)

    const newSessions = sessions?.filter((session) => session.id !== sessionId) ?? []
    this._sessions.set(newSessions)

    if (sessionId === this.sessionId()) {
      let newSessionId: string | null = null
      if (currentIndex !== undefined && currentIndex !== -1) {
        if (newSessions[currentIndex] !== undefined) {
          newSessionId = newSessions[currentIndex].id
          this.logger.debug('SessionsService.deleteSession.selectNext', { newSessionId })
        } else if (newSessions[currentIndex - 1] !== undefined) {
          newSessionId = newSessions[currentIndex - 1].id
          this.logger.debug('SessionsService.deleteSession.selectPrevious', { newSessionId })
        } else {
          newSessionId = null
          this.logger.debug('SessionsService.deleteSession.noMoreSection')
        }
      }

      this.setSessionId(newSessionId)

      return newSessionId
    }

    return null
  }

  async loadSessions() {
    const currentProject = this.currentProject()
    if (currentProject) {
      const response = await this.opencodeApi.getProjectSessions(currentProject)
      const sessions = response.data ?? []

      this.logger.debug('loadSessions', sessions)

      this._sessions.set(sessions)
    }
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

  setCurrentProject(currentProject: Project | null) {
    this.currentProject.set(currentProject)
  }
}
