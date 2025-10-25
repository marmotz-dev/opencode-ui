import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { map } from 'rxjs'
import { Logger } from '../shared/logger/logger.service'
import { OpencodeChatService } from '../shared/opencode/opencode-chat.service'
import { ChatAreaComponent } from './chat-area/chat-area.component'
import { MessageInputComponent } from './message-input/message-input.component'
import { ModelSelectorComponent } from './model-selector/model-selector.component'
import { SessionListComponent } from './session-list/session-list.component'
import { StatusComponent } from './status/status.component'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  imports: [SessionListComponent, ChatAreaComponent, MessageInputComponent, ModelSelectorComponent, StatusComponent],
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

  private readonly sessions = this.opencodeChat.sessions
  private readonly session = this.opencodeChat.session
  private readonly sessionMessages = this.opencodeChat.sessionMessages
  protected readonly modelSelectorVisible = this.opencodeChat.modelSelectorVisible

  constructor() {
    this.logger.debug('ChatComponent.constructor')

    effect(async () => this.loadSessionMessagesEffect())
    effect(async () => this.goToRootIfNoSessionEffect())
    effect(() => this.scrollToBottomEffect())
    effect(async () => this.navigateToFirstEffect())
  }

  private async goToRootIfNoSessionEffect() {
    const session = this.session()
    this.logger.debug('ChatComponent.effect.goToRootIfNoSession', { session })

    if (!session) {
      await this.router.navigate(['chat'])
    }
  }

  private async loadSessionMessagesEffect() {
    const sessionId = this.sessionId()
    this.logger.debug('ChatComponent.effect.loadSessionMessages', { sessionId })

    this.opencodeChat.setSessionId(sessionId)

    if (sessionId) {
      await this.opencodeChat.loadSessionMessages()
    }
  }

  private async navigateToFirstEffect() {
    const sessionId = this.sessionId()
    const sessions = this.sessions()
    this.logger.debug('ChatComponent.effect.navigateToFirst', { sessionId, sessions })

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
    this.logger.debug('ChatComponent.effect.scrollToBottom', { sessionId, sessionMessages })

    if (sessionId && sessionMessages?.length) {
      this.scrollToBottom()
    }
  }
}
