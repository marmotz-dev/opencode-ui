import { Component, inject, signal, viewChild } from '@angular/core'
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons'
import { Session } from '@opencode-ai/sdk/client'
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
  sessions = signal<Session[]>([])
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
  currentSessionId = this.opencodeService.currentSessionId

  constructor() {
    this.loadSessions()
  }

  async createNewSession() {
    const newSession = await this.opencodeService.createSession()
    if (newSession.data?.id) {
      await this.loadSessions()
      this.opencodeService.setCurrentSession(newSession.data.id)
    }
  }

  async deleteSession() {
    const sessionId = this.commandSessionId()
    if (sessionId) {
      await this.opencodeService.deleteSession(sessionId)
      await this.loadSessions()
    }
  }

  hideContextMenu() {
    this.commandSessionId.set(null)
  }

  async loadSessions() {
    try {
      const sessions = await this.opencodeService.getCurrentSessions()

      this.sessions.set(sessions.data ?? [])

      if (sessions.data && !this.currentSessionId()) {
        this.opencodeService.setCurrentSession(sessions.data[0].id)
      }
    } catch (error) {
      console.error(error)
    }
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
    this.opencodeService.setCurrentSession(id)
  }
}
