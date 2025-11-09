import { effect, inject, Injectable, signal } from '@angular/core'
import { ElectronService } from '../electron/electron.service'
import { AgentsService } from './modules/agents.service'
import { ConfigService } from './modules/config.service'
import { MessagesService } from './modules/messages.service'
import { ProjectsService } from './modules/projects.service'
import { ProvidersService } from './modules/providers.service'
import { SessionsService } from './modules/sessions.service'

@Injectable({
  providedIn: 'root',
})
export class OpencodeChatService {
  agents = inject(AgentsService)
  config = inject(ConfigService)
  messages = inject(MessagesService)
  providers = inject(ProvidersService)
  projects = inject(ProjectsService)
  sessions = inject(SessionsService)

  private _isIpcReady = signal(false)
  public isIpcReady = this._isIpcReady.asReadonly()

  constructor() {
    ElectronService.getIpcRenderer().once('ipc-ready', async () => {
      await this.init()
      this._isIpcReady.set(true)
    })

    effect(() => {
      this.sessions.setCurrentProject(this.projects.currentProject())
    })
  }

  async init() {
    await this.agents.init()
    await this.config.init()
    await this.providers.init()
    await this.projects.init()
  }
}
