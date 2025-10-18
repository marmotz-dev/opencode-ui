import { Component, inject, signal } from '@angular/core'
import { faPlus, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { Session } from '@opencode-ai/sdk/client'
import { Button } from 'primeng/button'
import { ClassNames } from 'primeng/classnames'
import { OpencodeService } from '../../shared/opencode'
import { IconUi } from '../../shared/ui/icon/icon.ui'

@Component({
  selector: 'app-session-list',
  imports: [Button, ClassNames, IconUi],
  templateUrl: './session-list.component.html',
})
export class SessionListComponent {
  sessions = signal<Session[]>([])

  private readonly opencodeService = inject(OpencodeService)

  currentSessionId = this.opencodeService.currentSessionId

  constructor() {
    try {
      this.opencodeService.getCurrentSessions().then((sessions) => {
        console.log(sessions)
        this.sessions.set(sessions.data ?? [])

        if (sessions.data) {
          this.opencodeService.setCurrentSession(sessions.data[0].id)
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  selectSession(id: string) {
    this.opencodeService.setCurrentSession(id)
  }

  createNewSession() {
    // const newId = Date.now().toString()
    // const newSession: Session = {
    //   id: newId,
    //   title: `New session ${newId}`,
    //   lastMessage: 'No message',
    // }
    // this.sessions.update((sessions) => [newSession, ...sessions])
    // this.selectedSessionId.set(newId)
  }

  protected readonly faPlus = faPlus
  protected readonly faPlusCircle = faPlusCircle
}
