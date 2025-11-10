import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core'
import { Router } from '@angular/router'
import { Session } from '@opencode-ai/sdk/client'
import { MenuItem } from 'primeng/api'
import { Button } from 'primeng/button'
import { ClassNames } from 'primeng/classnames'
import { ContextMenu } from 'primeng/contextmenu'
import { ElectronService } from '../../shared'
import { OpencodeChatService } from '../../shared/opencode'
import { IconUi } from '../../shared/ui/icon/icon.ui'
import { SessionRenamerComponent } from '../session-renamer/session-renamer.component'

@Component({
  selector: 'app-sessions-list',
  imports: [Button, ClassNames, IconUi, ContextMenu, SessionRenamerComponent],
  templateUrl: './session-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full',
  },
})
export class SessionListComponent {
  readonly contextMenu = viewChild<ContextMenu>('contextMenu')
  readonly commandSessionId = signal<string | null>(null)
  readonly renamerVisible = signal(false)
  readonly currentSession = signal<Session | null>(null)
  contextMenuItems: MenuItem[] = [
    {
      label: 'Rename',
      icon: 'pencil',
      command: () => this.renameSession(),
    },
    {
      label: 'Delete',
      icon: 'trash',
      iconClass: 'text-red-500',
      command: () => this.deleteSession(),
    },
  ]
  private readonly router = inject(Router)
  private readonly opencodeChat = inject(OpencodeChatService)
  sessionId = this.opencodeChat.sessions.sessionId
  sessions = this.opencodeChat.sessions.sessions
  isDev = ElectronService.isDev()

  async createNewSession() {
    const newSession = await this.opencodeChat.sessions.createSession()
    if (newSession?.id) {
      await this.router.navigate(['chat', newSession.id])
    }
  }

  async deleteSession() {
    const sessionId = this.commandSessionId()
    if (sessionId) {
      const newSessionId = await this.opencodeChat.sessions.deleteSession(sessionId)

      if (newSessionId) {
        await this.router.navigate(['chat', newSessionId])
      }
    }
  }

  async renameSession() {
    const sessionId = this.commandSessionId()
    const sessions = this.sessions()
    if (sessionId && sessions) {
      const session = sessions.find((s) => s.id === sessionId)
      if (session) {
        this.currentSession.set(session)
        this.renamerVisible.set(true)
      }
    }
  }

  async onSessionRenamed(newName: string) {
    const session = this.currentSession()
    if (session) {
      await this.opencodeChat.sessions.renameSession(session.id, newName)
      this.currentSession.set(null)
    }
  }

  hideRenamer() {
    this.renamerVisible.set(false)
    this.currentSession.set(null)
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

  async selectSession(id: string) {
    await this.router.navigate(['chat', id])
  }
}
