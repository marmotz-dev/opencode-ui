import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { Button } from 'primeng/button'
import { OpencodeChatService } from '../../shared/opencode/opencode-chat.service'

import { IconUi } from '../../shared/ui/icon/icon.ui'
import { TextareaUi } from '../../shared/ui/textarea/textarea.component'

@Component({
  selector: 'app-message-input',
  imports: [FormsModule, Button, IconUi, TextareaUi],
  templateUrl: './message-input.component.html',
})
export class MessageInputComponent {
  protected message = ''
  private readonly opencodeChat = inject(OpencodeChatService)

  async onSend(event: Event) {
    event.preventDefault()

    const message = this.message.trim()

    if (message.length > 0) {
      await this.opencodeChat.prompt(message)
    }

    setTimeout(() => {
      this.message = ''
    })
  }
}
