import { effect, inject, Injectable } from '@angular/core'
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

  constructor() {
    effect(() => {
      this.sessions.setCurrentProject(this.projects.currentProject())
    })
  }
}
