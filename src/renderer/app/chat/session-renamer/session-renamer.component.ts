import { ChangeDetectionStrategy, Component, effect, input, model, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Session } from '@opencode-ai/sdk/client'
import { Button } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { InputText } from 'primeng/inputtext'
import { IconUi } from '../../shared/ui/icon/icon.ui'

@Component({
  selector: 'app-session-renamer',
  imports: [DialogModule, InputText, Button, FormsModule, IconUi],
  templateUrl: './session-renamer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionRenamerComponent {
  readonly visible = input<boolean>(false)
  readonly session = input<Session | null>(null)

  readonly renamed = output<string>()
  readonly visibleChange = output<boolean>()

  newName = model<string>('')

  constructor() {
    effect(() => {
      const session = this.session()
      if (session) {
        this.newName.set(session.title)
      }
    })
  }

  save() {
    const name = this.newName().trim()
    if (name) {
      this.renamed.emit(name)
      this.hide()
    }
  }

  cancel() {
    this.hide()
  }

  hide() {
    this.visibleChange.emit(false)
    this.newName.set('')
  }
}
