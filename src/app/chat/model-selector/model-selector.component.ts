import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { InputText } from 'primeng/inputtext'
import { ListboxModule } from 'primeng/listbox'
import { ModelNameComponent } from '../../shared/components/model-name/model-name.component'
import { Model } from '../../shared/opencode'
import { OpencodeChatService } from '../../shared/opencode/opencode-chat.service'

@Component({
  selector: 'app-model-selector',
  standalone: true,
  imports: [DialogModule, ListboxModule, ButtonModule, InputText, FormsModule, ModelNameComponent],
  templateUrl: './model-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelSelectorComponent {
  private opencodeChat = inject(OpencodeChatService)

  readonly visible = input.required<boolean>()

  searchTerms = model<string>('')
  providerModels = computed(() => {
    const providers = this.opencodeChat.providers()
    if (!providers) {
      return []
    }

    const providerModels: Model[] = []
    for (const provider of providers.providers) {
      for (const model of Object.values(provider.models)) {
        providerModels.push({
          providerID: provider.id,
          providerName: provider.name,
          modelID: model.id,
          modelName: model.name,
        })
      }
    }

    return providerModels
  })
  filteredProviderModels = computed(() => {
    const searchWords = this.searchTerms()
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    const providerModels = this.providerModels()

    if (searchWords.length === 0) {
      return providerModels
    }

    return providerModels.filter((model) => {
      return searchWords.every(
        (word) => model.providerName.toLowerCase().includes(word) || model.modelName.toLowerCase().includes(word)
      )
    })
  })

  select(model: Model) {
    this.opencodeChat.setNextPromptModel(model)
    this.hide()
  }

  visibleChanged(visible: boolean) {
    if (!visible) {
      this.hide()
    }
  }

  hide() {
    this.opencodeChat.closeModelSelector()
  }
}
