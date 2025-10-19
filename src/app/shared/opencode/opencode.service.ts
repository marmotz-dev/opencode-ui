import { inject, Injectable, signal } from '@angular/core'
import { Event } from '@opencode-ai/sdk/client'
import { ElectronService } from '../../core/services'
import {
  CreateSessionResponse,
  GetCurrentSessionsResponse,
  GetSessionMessagesResponse,
  SessionMessage,
} from './opencode.types'

@Injectable({
  providedIn: 'root',
})
export class OpencodeService {
  private electronService = inject(ElectronService)

  private _currentSessionId = signal<string | null>(null)
  public currentSessionId = this._currentSessionId.asReadonly()

  private _sessionMessages = signal<SessionMessage[] | null>(null)
  public sessionMessages = this._sessionMessages.asReadonly()

  private debounceMessageLoad?: ReturnType<typeof setTimeout>

  constructor() {
    this.listenEvents()
  }

  async createSession(): Promise<CreateSessionResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.session.create')
  }

  deleteSession(id: string): Promise<void> {
    return this.electronService.ipcRenderer.invoke('opencode.session.delete', id)
  }

  async getCurrentSessions(): Promise<GetCurrentSessionsResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.session.get-all')
  }

  listenEvents() {
    this.electronService.ipcRenderer.on('opencode.event', (_e, event: Event) => {
      console.log('New opencode event', event)

      if (event.type.endsWith('.updated')) {
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
    const currentSessionId = this.currentSessionId()
    if (currentSessionId) {
      await this.electronService.ipcRenderer.invoke('opencode.session.prompt', currentSessionId, message)
    }
  }

  setCurrentSession(id: string) {
    this._currentSessionId.set(id)

    if (id) {
      this.getSessionMessages()
    }
  }

  getSessionMessages() {
    this.electronService.ipcRenderer
      .invoke('opencode.session.messages.get-all', this._currentSessionId())
      .then((response: GetSessionMessagesResponse) => {
        console.log(response)

        this._sessionMessages.set(response.data ?? [])
      })
  }
}
