import { Component, input } from '@angular/core'
import { Message, TextPart } from '@opencode-ai/sdk/client'
import { MarkdownComponent } from 'ngx-markdown'
import { ClassNames } from 'primeng/classnames'
import { RelativeTimePipe } from '../../pipes/relative-time.pipe'

@Component({
  selector: 'app-text-part',
  imports: [ClassNames, MarkdownComponent, RelativeTimePipe],
  templateUrl: './text-part.component.html',
})
export class TextPartComponent {
  info = input.required<Message>()
  part = input.required<TextPart>()
  username = input<string>('user')

  getRelativeTime(): string {
    return new Date(this.info().time.created).toLocaleString()
  }
}
