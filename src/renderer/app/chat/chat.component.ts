import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { map } from 'rxjs'
import { Logger } from '../shared/logger/logger.service'
import { OpencodeChatService } from '../shared/opencode'
import { ChatAreaComponent } from './chat-area/chat-area.component'
import { MessageInputComponent } from './message-input/message-input.component'
import { ModelSelectorComponent } from './model-selector/model-selector.component'
import { ProjectSelectorComponent } from './project-selector/project-selector.component'
import { SessionListComponent } from './session-list/session-list.component'
import { StatusComponent } from './status/status.component'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  imports: [
    SessionListComponent,
    ChatAreaComponent,
    MessageInputComponent,
    ModelSelectorComponent,
    StatusComponent,
    ProjectSelectorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {
  private logger = new Logger(ChatComponent.name)

  private readonly opencodeChat = inject(OpencodeChatService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  protected readonly sessionId = toSignal(this.route.paramMap.pipe(map((params) => params.get('sessionId') ?? null)), {
    initialValue: null,
  })
  private scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer')

  private readonly sessions = this.opencodeChat.sessions.sessions
  private readonly session = this.opencodeChat.sessions.session
  private readonly sessionMessages = this.opencodeChat.messages.sessionMessages
  protected readonly modelSelectorVisible = this.opencodeChat.providers.modelSelectorVisible
  protected readonly projectSelectorVisible = this.opencodeChat.projects.projectSelectorVisible
  protected readonly currentProject = this.opencodeChat.projects.currentProject

  constructor() {
    this.logger.debug('constructor')

    effect(async () => this.loadSessionMessagesEffect())
    effect(async () => this.goToRootIfNoSessionEffect())
    effect(() => this.scrollToBottomEffect())
    effect(async () => this.navigateToFirstEffect())
  }

  private async goToRootIfNoSessionEffect() {
    const session = this.session()
    this.logger.debug('effect.goToRootIfNoSession', { session })

    if (!session) {
      await this.router.navigate(['chat'])
    }
  }

  private async loadSessionMessagesEffect() {
    const currentProject = this.currentProject()
    const sessionId = this.sessionId()
    this.logger.debug('effect.loadSessionMessages', { currentProject, sessionId })

    if (!currentProject) {
      return
    }

    this.opencodeChat.sessions.setSessionId(sessionId)
  }

  private async navigateToFirstEffect() {
    const sessionId = this.sessionId()
    const sessions = this.sessions()
    this.logger.debug('effect.navigateToFirst', { sessionId, sessions })

    if (sessions && sessions.length && !sessionId) {
      await this.router.navigate(['chat', sessions[0].id])
    }
  }

  private scrollToBottom() {
    const element = this.scrollContainer()?.nativeElement
    if (element) {
      setTimeout(() => {
        element.scrollTop = element.scrollHeight
      })
    }
  }

  private scrollToBottomEffect() {
    const sessionId = this.sessionId()
    const sessionMessages = this.sessionMessages()
    this.logger.debug('effect.scrollToBottom', { sessionId, sessionMessages })

    if (sessionId && sessionMessages?.length) {
      this.scrollToBottom()
    }
  }
}
