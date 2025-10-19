import { inject, Injectable, signal } from '@angular/core'
import { Event, Session } from '@opencode-ai/sdk/client'
import { ElectronService } from '../../core/services'
import {
  CreateSessionResponse,
  GetSessionMessagesResponse,
  GetSessionsResponse,
  SessionMessage,
} from './opencode.types'

@Injectable({
  providedIn: 'root',
})
export class OpencodeService {
  private electronService = inject(ElectronService)

  private _currentSessionId = signal<string | null>(null)
  public currentSessionId = this._currentSessionId.asReadonly()

  private _sessions = signal<Session[] | null>(null)
  public sessions = this._sessions.asReadonly()

  private _sessionMessages = signal<SessionMessage[] | null>(null)
  public sessionMessages = this._sessionMessages.asReadonly()

  private debounceSessionLoad?: ReturnType<typeof setTimeout>
  private debounceMessageLoad?: ReturnType<typeof setTimeout>

  constructor() {
    this.listenEvents()
  }

  async createSession(): Promise<CreateSessionResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.session.create')
  }

  async deleteSession(id: string) {
    const sessions = this.sessions()

    await this.electronService.ipcRenderer.invoke('opencode.session.delete', id)

    if (id === this._currentSessionId() && sessions && sessions?.length > 0) {
      const currentIndex = sessions.findIndex((session) => session.id === id)
      sessions.splice(currentIndex, 1)
      const nextSession = sessions[currentIndex] ?? sessions[currentIndex - 1]
      this._sessions.set(sessions.length > 0 ? sessions : null)
      if (nextSession) {
        this.setCurrentSessionId(nextSession.id)
      } else {
        this._sessionMessages.set(null)
        this.setCurrentSessionId(null)
      }
    }
  }

  async getSessionMessages() {
    const response: GetSessionMessagesResponse = await this.electronService.ipcRenderer.invoke(
      'opencode.session.messages.get-all',
      this._currentSessionId()
    )
    console.log('getSessionMessages', { sessionId: this._currentSessionId(), data: response.data })

    this._sessionMessages.set(response.data ?? [])
  }

  async getSessions() {
    const response: GetSessionsResponse = await this.electronService.ipcRenderer.invoke('opencode.session.get-all')
    console.log('getSessions', response.data)

    this._sessions.set(response.data ?? [])
  }

  listenEvents() {
    this.electronService.ipcRenderer.on('opencode.event', (_e, event: Event) => {
      console.log('New opencode event', event)

      if (event.type.startsWith('session.')) {
        if (this.debounceSessionLoad) {
          clearTimeout(this.debounceSessionLoad)
        }

        this.debounceSessionLoad = setTimeout(() => {
          this.getSessions()
        }, 100)
      }

      if (event.type.startsWith('message.')) {
        if (this.debounceMessageLoad) {
          clearTimeout(this.debounceMessageLoad)
        }

        this.debounceMessageLoad = setTimeout(() => {
          this.getSessionMessages()
        }, 100)
      }
    })
  }

  async prompt(message: string) {
    let currentSessionId = this.currentSessionId()
    if (!currentSessionId) {
      const session = await this.createSession()
      currentSessionId = session.data?.id!
      this.setCurrentSessionId(currentSessionId)
    }

    await this.electronService.ipcRenderer.invoke('opencode.session.prompt', currentSessionId, message)
  }

  setCurrentSessionId(id: string | null) {
    this._currentSessionId.set(id)

    if (id) {
      this.getSessionMessages()
    }
  }
}
