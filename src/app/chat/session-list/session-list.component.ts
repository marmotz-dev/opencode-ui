import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core'
import { Router } from '@angular/router'
import { MenuItem } from 'primeng/api'
import { Button } from 'primeng/button'
import { ClassNames } from 'primeng/classnames'
import { ContextMenu } from 'primeng/contextmenu'
import { environment } from '../../../environments/environment'
import { OpencodeChatService } from '../../shared/opencode/opencode-chat.service'
import { IconUi } from '../../shared/ui/icon/icon.ui'

@Component({
  selector: 'app-session-list',
  imports: [Button, ClassNames, IconUi, ContextMenu],
  templateUrl: './session-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionListComponent {
  readonly contextMenu = viewChild<ContextMenu>('contextMenu')
  readonly commandSessionId = signal<string | null>(null)
  contextMenuItems: MenuItem[] = [
    // { label: 'Rename', icon: faPencil },
    {
      label: 'Delete',
      icon: 'trash',
      iconClass: 'text-red-500',
      command: () => this.deleteSession(),
    },
  ]
  protected readonly environment = environment
  private readonly router = inject(Router)
  private readonly opencodeChat = inject(OpencodeChatService)
  sessionId = this.opencodeChat.sessionId
  sessions = this.opencodeChat.sessions

  async createNewSession() {
    const newSession = await this.opencodeChat.createSession()
    if (newSession?.id) {
      await this.router.navigate(['chat', newSession.id])
    }
  }

  async deleteSession() {
    const sessionId = this.commandSessionId()
    if (sessionId) {
      const newSessionId = await this.opencodeChat.deleteSession(sessionId)

      if (newSessionId) {
        await this.router.navigate(['chat', newSessionId])
      }
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

  async selectSession(id: string) {
    await this.router.navigate(['chat', id])
  }
}
