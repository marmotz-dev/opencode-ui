import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'
import { ToolPart } from '@opencode-ai/sdk'
import { Message } from '@opencode-ai/sdk/client'
import { RelativeTimePipe } from '../../pipes/relative-time.pipe'

@Component({
  selector: 'app-tool-part',
  imports: [CommonModule, RelativeTimePipe],
  templateUrl: './tool-part.component.html',
})
export class ToolPartComponent {
  info = input.required<Message>()
  part = input.required<ToolPart>()
}
