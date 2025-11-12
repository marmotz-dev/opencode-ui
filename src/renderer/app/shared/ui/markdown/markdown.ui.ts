import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core'
import hljs from 'highlight.js'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'

marked.use(
  markedHighlight({
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }

      return code
    },
  })
)

let highlightAllTimer: string | number | NodeJS.Timeout | undefined

@Component({
  selector: 'app-ui-markdown',
  imports: [],
  template: `
    <div
      [innerHTML]="innerHTML()"
      class="flex max-w-full flex-col overflow-auto wrap-break-word whitespace-pre-line"
    ></div>
  `,
  styleUrls: ['./markdown.ui.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownUi {
  data = input.required<string>()
  innerHTML = signal<string>('')

  constructor() {
    effect(async () => {
      const data = this.data()

      if (data) {
        const result = await marked(data)

        this.innerHTML.set(result.toString())

        if (highlightAllTimer) {
          clearTimeout(highlightAllTimer)
        }

        highlightAllTimer = setTimeout(() => {
          hljs.highlightAll()
          console.log('highlightAll')
        }, 10)
      } else {
        this.innerHTML.set('')
      }
    })
  }
}
