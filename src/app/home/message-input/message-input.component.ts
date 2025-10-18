import { Component, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

import { Button } from 'primeng/button'

import { IconUi } from '../../shared/ui/icon/icon.ui'
import { TextareaUi } from '../../shared/ui/textarea/textarea.component'

@Component({
  selector: 'app-message-input',
  imports: [FormsModule, Button, IconUi, TextareaUi],
  templateUrl: './message-input.component.html',
})
export class MessageInputComponent {
  message = ''
  sendMessage = output<string>()
  protected readonly faPaperPlane = faPaperPlane

  onSend() {
    if (this.message.trim()) {
      this.sendMessage.emit(this.message)
      this.message = ''
    }
  }
}
