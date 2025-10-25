import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  model,
  numberAttribute,
  viewChild,
} from '@angular/core'
import { ClassNames } from 'primeng/classnames'
import { TextareaModule } from 'primeng/textarea'

@Component({
  selector: 'app-ui-textarea',
  imports: [TextareaModule, ClassNames],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.css',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaUi {
  readonly value = model<string>('')
  readonly styleClass = input<string>()
  readonly placeholder = input<string>()
  readonly autoResize = input(false, { transform: booleanAttribute })
  readonly autoResizeMinHeight = input<number, unknown>(undefined, { transform: numberAttribute })
  readonly autoResizeMaxHeight = input<number, unknown>(undefined, { transform: numberAttribute })

  readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textarea')

  constructor() {
    effect(() => {
      const value = this.value()

      // if the value was forced to undefined without a user input, then we launch the field resizing asynchronously
      if (!value) {
        setTimeout(() => this.resize())
      }
    })
  }

  onResize(): void {
    const textarea = this.textarea()

    if (textarea && this.autoResize()) {
      const elementStyle = textarea.nativeElement.style

      const height = parseFloat(elementStyle.height)
      const minHeight = parseFloat(elementStyle.minHeight)

      if (height <= minHeight) {
        elementStyle.height = elementStyle.minHeight
      }
    }
  }

  resize() {
    const textarea = this.textarea()

    if (textarea && this.autoResize()) {
      textarea.nativeElement.dispatchEvent(new Event('input'))
    }
  }

  valueChanged(event: Event): void {
    const value = (event.target as HTMLInputElement).value

    this.value.set(value)
  }
}
