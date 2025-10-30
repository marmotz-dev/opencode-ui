import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core'
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
  host: {
    '(keydown)': 'onKeyDown($event)',
  },
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

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput')

  searchTerms = model<string>('')
  selectedIndex = signal<number>(-1)

  constructor() {
    // Handle all selection logic: opening dialog and filtering changes
    effect(() => {
      const visible = this.visible()
      const filtered = this.filteredItems()
      const currentIndex = this.selectedIndex()

      if (!visible) {
        // Dialog is closed, ensure we're reset
        if (currentIndex !== -1) {
          this.selectedIndex.set(-1)
        }
        return
      }

      // Dialog is open
      if (filtered.length === 0) {
        // No items available
        if (currentIndex !== -1) {
          this.selectedIndex.set(-1)
        }
      } else {
        // Items available
        if (currentIndex === -1) {
          // No selection, select first item
          this.selectedIndex.set(0)
        } else if (currentIndex >= filtered.length) {
          // Selection out of bounds due to filtering, select last available
          this.selectedIndex.set(filtered.length - 1)
        }
      }
    })
  }

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

  selectCurrentItem() {
    const filtered = this.filteredItems()
    const index = this.selectedIndex()
    if (index >= 0 && index < filtered.length) {
      this.select(filtered[index])
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.visible()) return

    const filtered = this.filteredItems()
    const currentIndex = this.selectedIndex()

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (filtered.length === 0) break

        if (currentIndex === -1) {
          // First time pressing down, select first item
          this.selectedIndex.set(0)
        } else {
          // Move to next item (circular navigation)
          this.selectedIndex.set((currentIndex + 1) % filtered.length)
        }
        break

      case 'ArrowUp':
        event.preventDefault()
        if (filtered.length === 0) break

        if (currentIndex === -1) {
          // First time pressing up, select last item
          this.selectedIndex.set(filtered.length - 1)
        } else {
          // Move to previous item (circular navigation)
          this.selectedIndex.set(currentIndex === 0 ? filtered.length - 1 : currentIndex - 1)
        }
        break

      case 'Enter':
        event.preventDefault()
        if (currentIndex >= 0) {
          this.selectCurrentItem()
        }
        break

      case 'Escape':
        event.preventDefault()
        this.hide()
        break
    }
  }

  visibleChanged(visible: boolean) {
    if (!visible) {
      this.hide()
    } else {
      // Focus the search input when dialog opens
      setTimeout(() => {
        const input = this.searchInput()
        if (input) {
          input.nativeElement.focus()
        }
      }, 100)
    }
  }

  onMouseEnter(index: number) {
    this.selectedIndex.set(index)
  }

  hide() {
    this.visibleChange.emit(false)
    this.searchTerms.set('')
    this.selectedIndex.set(-1)
  }
}
