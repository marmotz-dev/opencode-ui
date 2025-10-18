import { Injectable, inject, signal } from '@angular/core'
import { BadRequestError, NotFoundError, Session } from '@opencode-ai/sdk/client'
import { ElectronService } from '../../core/services'
import { SessionMessage } from './opencode.types'

type GetCurrentSessionsResponse =
  | ({ data: Session[]; error: undefined } & { request: Request; response: Response })
  | ({ data: undefined; error: unknown } & { request: Request; response: Response })
type GetSessionMessagesResponse =
  | ({ data: SessionMessage[]; error: undefined } & { request: Request; response: Response })
  | ({ data: undefined; error: BadRequestError | NotFoundError } & { request: Request; response: Response })

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
    return this.electronService.ipcRenderer.invoke('get-current-sessions')
  }

  setCurrentSession(id: string) {
    this._currentSessionId.set(id)

    if (id) {
      this.electronService.ipcRenderer
        .invoke('get-session-messages', id)
        .then((response: GetSessionMessagesResponse) => {
          console.log(response)

          this._sessionMessages.set(response.data ?? [])
        })
    } else {
      return null
    }
  }
}
