import { Component, input, signal } from '@angular/core'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { ClassNames } from 'primeng/classnames'
import { IconUi } from '../icon/icon.ui'

@Component({
  selector: 'app-ui-collapsible',
  imports: [IconUi, ClassNames],
  templateUrl: './collapsible.component.html',
  styleUrl: './collapsible.component.css',
})
export class CollapsibleUi {
  readonly header = input.required<string>()
  readonly styleClass = input<any>()

  protected opened = signal<boolean>(false)

  protected readonly faChevronDown = faChevronDown
  protected readonly faChevronUp = faChevronUp

  toggle() {
    this.opened.update((opened) => !opened)
  }
}
