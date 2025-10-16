import { Component, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { TranslatePipe } from '@ngx-translate/core'
import { Button } from 'primeng/button'
import { Textarea } from 'primeng/textarea'
import { IconUi } from '../../shared/ui/icon/icon.ui'
import { TextareaUi } from '../../shared/ui/textarea/textarea.component'

@Component({
  selector: 'app-message-input',
  imports: [FormsModule, Button, Textarea, IconUi, TextareaUi, TranslatePipe],
  templateUrl: './message-input.component.html',
})
export class MessageInputComponent {
  message = ''
  sendMessage = output<string>()

  onSend() {
    if (this.message.trim()) {
      this.sendMessage.emit(this.message)
      this.message = ''
    }
  }

  protected readonly faPaperPlane = faPaperPlane
}
