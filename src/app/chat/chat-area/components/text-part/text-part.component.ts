import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Message, TextPart } from '@opencode-ai/sdk/client'
import { ClassNames } from 'primeng/classnames'
import { MarkdownUi } from '../../../../shared/ui/markdown/markdown.component'
import { RelativeTimePipe } from '../../pipes/relative-time.pipe'

@Component({
  selector: 'app-text-part',
  imports: [ClassNames, RelativeTimePipe, MarkdownUi],
  templateUrl: './text-part.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextPartComponent {
  info = input.required<Message>()
  part = input.required<TextPart>()
}
