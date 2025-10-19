import { Component, effect, inject, signal, viewChild } from '@angular/core'
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons'
import { Button } from 'primeng/button'
import { ClassNames } from 'primeng/classnames'
import { ContextMenu } from 'primeng/contextmenu'
import { OpencodeService } from '../../shared/opencode'
import { IconUi } from '../../shared/ui/icon/icon.ui'

@Component({
  selector: 'app-session-list',
  imports: [Button, ClassNames, IconUi, ContextMenu],
  templateUrl: './session-list.component.html',
})
export class SessionListComponent {
  readonly contextMenu = viewChild<ContextMenu>('contextMenu')
  readonly commandSessionId = signal<string | null>(null)
  contextMenuItems = [
    // { label: 'Rename', icon: faPencil },
    {
      label: 'Delete',
      icon: faTrash,
      iconClass: 'text-red-500',
      command: () => this.deleteSession(),
    },
  ]
  protected readonly faPlusCircle = faPlusCircle
  private readonly opencodeService = inject(OpencodeService)
  sessions = this.opencodeService.sessions
  currentSessionId = this.opencodeService.currentSessionId

  constructor() {
    this.opencodeService.getSessions()

    effect(() => {
      const sessions = this.sessions()
      const currentSessionId = this.currentSessionId()

      if (sessions && sessions.length > 0 && !currentSessionId) {
        this.opencodeService.setCurrentSessionId(sessions[0].id)
      }
    })
  }

  async createNewSession() {
    const newSession = await this.opencodeService.createSession()
    if (newSession.data?.id) {
      this.opencodeService.setCurrentSessionId(newSession.data.id)
    }
  }

  async deleteSession() {
    const sessionId = this.commandSessionId()
    if (sessionId) {
      await this.opencodeService.deleteSession(sessionId)
    }
  }

  hideContextMenu() {
    this.commandSessionId.set(null)
  }

  openContextMenu(event: PointerEvent, sessionId: string) {
    const contextMenu = this.contextMenu()

    if (contextMenu && event.currentTarget) {
      contextMenu.target = event.currentTarget as HTMLElement
      contextMenu.show(event)

      this.commandSessionId.set(sessionId)
    } else {
      this.commandSessionId.set(null)
    }
  }

  selectSession(id: string) {
    this.opencodeService.setCurrentSessionId(id)
  }
}
