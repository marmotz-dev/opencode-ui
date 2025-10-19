import { Component, input } from '@angular/core'
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome'
import { ClassNames } from 'primeng/classnames'

@Component({
  selector: 'app-ui-icon',
  imports: [FaIconComponent, ClassNames],
  template: `<fa-icon
    [icon]="icon()"
    [pClass]="['inline-block', styleClass()]"
  />`,
})
export class IconUi {
  readonly icon = input.required<IconDefinition>()
  readonly styleClass = input<any>()
}
