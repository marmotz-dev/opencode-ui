import { CommonModule } from '@angular/common'
import { Component, computed, input } from '@angular/core'
import { ToolPart } from '@opencode-ai/sdk'
import { Message } from '@opencode-ai/sdk/client'
import { createPatch } from 'diff'
import stripAnsi from 'strip-ansi'
import { CollapsibleUi } from '../../../../shared/ui/collapsible/collapsible.component'
import { MarkdownUi } from '../../../../shared/ui/markdown/markdown.component'
import { PartTimeDurationPipe } from '../../pipes/part-time-duration.pipe'
import { RelativeTimePipe } from '../../pipes/relative-time.pipe'

@Component({
  selector: 'app-tool-part',
  imports: [CommonModule, RelativeTimePipe, MarkdownUi, CollapsibleUi],
  templateUrl: './tool-part.component.html',
})
export class ToolPartComponent {
  info = input.required<Message>()
  part = input.required<ToolPart>()
  protected output = computed(() => {
    const part = this.part()
    let output = ''
    let before = ''
    let language = ''

    if (part.state.status !== 'pending') {
      if (part.state.metadata?.preview) {
        output = part.state.metadata?.preview as string
      } else if (part.state.status === 'completed') {
        output = part.state.output
      }

      if (part.tool === 'edit') {
        const input = part.state.input as Record<string, string>
        language = 'diff'
        before = '`' + input.filePath + '`'
        output = createPatch(input.filePath, input.oldString, input.newString)
          // remove 5 first lines (useless path info)
          .split('\n')
          .slice(5)
          // remove "\ No newline at end of file" lines
          .filter((line) => line !== '\\ No newline at end of file')
          // rebuild string
          .join('\n')
      }
    }

    if (part.tool === 'bash') {
      language = 'shell'
      output = stripAnsi(output)
    }

    return output ? `${before ? before + '\n' : ''}\`\`\`${language}\n` + output + '\n```' : output
  })
  private partTimeDurationPipe = new PartTimeDurationPipe()
  protected header = computed(() => {
    const part = this.part()
    let header = part.tool

    if (part.state.status === 'completed') {
      header += ' during ' + this.partTimeDurationPipe.transform(part.state.time) + ' seconds :'
    }

    return header
  })
}
