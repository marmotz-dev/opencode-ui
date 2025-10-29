import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, contentChildren, input, model, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PrimeTemplate } from 'primeng/api'
import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { InputText } from 'primeng/inputtext'
import { ListboxModule } from 'primeng/listbox'

export type SelectorItem<T = any> = {
  id: string
  label: string
  data: T
}

@Component({
  selector: 'app-selector',
  imports: [CommonModule, DialogModule, ListboxModule, ButtonModule, InputText, FormsModule],
  templateUrl: './selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorComponent<T> {
  readonly visible = input.required<boolean>()
  readonly items = input.required<SelectorItem<T>[]>()
  readonly header = input<string>('Select Item')
  readonly placeholder = input<string>('Search...')

  readonly selected = output<T>()
  readonly visibleChange = output<boolean>()

  readonly templates = contentChildren(PrimeTemplate)
  readonly itemTemplate = computed(() => {
    return this.templates().find((t) => t.name === 'item')?.template || null
  })
  readonly actionsTemplate = computed(() => {
    return this.templates().find((t) => t.name === 'actions')?.template || null
  })

  searchTerms = model<string>('')

  filteredItems = computed(() => {
    const searchWords = this.searchTerms()
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    const items = this.items()

    if (searchWords.length === 0) {
      return items
    }

    return items.filter((item) => {
      const searchText = `${item.label}}`.toLowerCase()

      return searchWords.every((word) => searchText.includes(word))
    })
  })

  select(item: SelectorItem<T>) {
    this.selected.emit(item.data)
    this.hide()
  }

  visibleChanged(visible: boolean) {
    if (!visible) {
      this.hide()
    }
  }

  hide() {
    this.visibleChange.emit(false)
  }
}
