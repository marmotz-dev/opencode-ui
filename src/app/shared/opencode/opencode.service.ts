import { Injectable, inject, signal } from '@angular/core'
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

  async getCurrentSessions(): Promise<GetCurrentSessionsResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.session.get-all')
  }

  setCurrentSession(id: string) {
    this._currentSessionId.set(id)

    if (id) {
      this.electronService.ipcRenderer
        .invoke('opencode.session.messages.get-all', id)
        .then((response: GetSessionMessagesResponse) => {
          console.log(response)

          this._sessionMessages.set(response.data ?? [])
        })
    }
  }

  deleteSession(id: string): Promise<void> {
    return this.electronService.ipcRenderer.invoke('opencode.session.delete', id)
  }

  async createSession(): Promise<CreateSessionResponse> {
    return this.electronService.ipcRenderer.invoke('opencode.session.create')
  }
}
