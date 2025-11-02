import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { FaIconComponent, IconName, IconPrefix } from '@fortawesome/angular-fontawesome'
import { ClassNames } from 'primeng/classnames'

@Component({
  selector: 'app-ui-icon',
  imports: [FaIconComponent, ClassNames],
  templateUrl: './icon.ui.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconUi {
  readonly prefix = input<IconPrefix | undefined>()
  readonly name = input.required<IconName>()
  readonly styleClass = input<any>()
}
