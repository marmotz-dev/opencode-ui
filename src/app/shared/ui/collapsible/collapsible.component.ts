import { Component, effect, input, signal } from '@angular/core'
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
  readonly collapse = input<boolean>(true)
  readonly styleClass = input<any>()

  protected opened = signal<boolean>(false)
  protected triggered = signal<boolean>(false)

  constructor() {
    effect(() => {
      const collapse = this.collapse()
      const triggerred = this.triggered()

      if (!triggerred) {
        this.opened.set(collapse)
      }
    })
  }

  toggle() {
    this.opened.update((opened) => !opened)
    this.triggered.set(true)
  }
}
