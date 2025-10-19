import { Component, effect, ElementRef, inject, viewChild } from '@angular/core'
import { OpencodeService } from '../shared/opencode'
import { ChatAreaComponent } from './chat-area/chat-area.component'
import { MessageInputComponent } from './message-input/message-input.component'
import { SessionListComponent } from './session-list/session-list.component'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [SessionListComponent, ChatAreaComponent, MessageInputComponent],
})
export class HomeComponent {
  private readonly opencodeService = inject(OpencodeService)
  sessionMessages = this.opencodeService.sessionMessages
  private scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer')

  constructor() {
    effect(() => {
      if (this.sessionMessages()?.length) {
        this.scrollToBottom()
      }
    })
  }

  private scrollToBottom() {
    const element = this.scrollContainer()?.nativeElement
    if (element) {
      setTimeout(() => {
        element.scrollTop = element.scrollHeight
      })
    }
  }
}
