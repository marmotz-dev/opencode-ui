import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Model } from '../../shared/opencode'

@Component({
  selector: 'app-model-name',
  templateUrl: './model-name.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelNameComponent {
  model = input.required<Model>()
}
