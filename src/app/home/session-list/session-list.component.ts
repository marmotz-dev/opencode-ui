import { Component, signal } from '@angular/core'
import { faPlus, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { Button } from 'primeng/button'
import { ClassNames } from 'primeng/classnames'
import { IconUi } from '../../shared/ui/icon/icon.ui'

interface Session {
  id: string
  title: string
  lastMessage: string
}

@Component({
  selector: 'app-session-list',
  imports: [Button, ClassNames, IconUi],
  templateUrl: './session-list.component.html',
})
export class SessionListComponent {
  sessions = signal<Session[]>([
    { id: '1', title: 'Session 1', lastMessage: 'Last message...' },
    { id: '2', title: 'Session 2', lastMessage: 'Other message...' },
  ])

  selectedSessionId = signal<string | null>(null)

  selectSession(id: string) {
    this.selectedSessionId.set(id)
  }

  createNewSession() {
    const newId = Date.now().toString()
    const newSession: Session = {
      id: newId,
      title: `New session ${newId}`,
      lastMessage: 'No message',
    }
    this.sessions.update((sessions) => [newSession, ...sessions])
    this.selectedSessionId.set(newId)
  }

  protected readonly faPlus = faPlus
  protected readonly faPlusCircle = faPlusCircle
}
