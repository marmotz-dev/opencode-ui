import { Component, input } from '@angular/core'
import { MarkdownComponent } from 'ngx-markdown'

@Component({
  selector: 'app-ui-markdown',
  imports: [MarkdownComponent],
  template: `
    <markdown
      [data]="data()"
      class="flex flex-col whitespace-pre-line"
    />
  `,
  styleUrls: ['./markdown.component.css'],
})
export class MarkdownUi {
  data = input.required<string>()
}
