import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Message, ReasoningPart } from '@opencode-ai/sdk/client'
import { CollapsibleUi } from '../../../../shared/ui/collapsible/collapsible.ui'
import { MarkdownUi } from '../../../../shared/ui/markdown/markdown.ui'
import { PartTimeDurationPipe } from '../../pipes/part-time-duration.pipe'
import { RelativeTimePipe } from '../../pipes/relative-time.pipe'

@Component({
  selector: 'app-reasoning-part',
  imports: [RelativeTimePipe, MarkdownUi, CollapsibleUi, PartTimeDurationPipe],
  templateUrl: './reasoning-part.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReasoningPartComponent {
  info = input.required<Message>()
  part = input.required<ReasoningPart>()
}
