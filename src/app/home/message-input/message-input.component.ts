import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

import { Button } from 'primeng/button'
import { OpencodeService } from '../../shared/opencode'

import { IconUi } from '../../shared/ui/icon/icon.ui'
import { TextareaUi } from '../../shared/ui/textarea/textarea.component'

@Component({
  selector: 'app-message-input',
  imports: [FormsModule, Button, IconUi, TextareaUi],
  templateUrl: './message-input.component.html',
})
export class MessageInputComponent {
  protected readonly faPaperPlane = faPaperPlane
  protected message = ''
  private readonly opencodeService = inject(OpencodeService)

  onSend() {
    const message = this.message.trim()

    if (message.length > 0) {
      this.opencodeService.prompt(message)
      this.message = ''
    }
  }
}
