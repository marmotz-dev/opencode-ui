import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'
import { MarkdownComponent } from 'ngx-markdown'

@Component({
  selector: 'app-ui-markdown',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  template: `
    <markdown
      [data]="data()"
      class="flex flex-col whitespace-pre-line"
    />
  `,
  styleUrls: ['./markdown.component.css'],
  changeDetection: 0, // OnPush
})
export class MarkdownUi {
  data = input.required<string>()
}
