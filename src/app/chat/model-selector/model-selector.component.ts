import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { PrimeTemplate } from 'primeng/api'
import { ModelNameComponent } from '../model-name/model-name.component'
import { SelectorComponent, SelectorItem } from '../../shared/ui/selector/selector.ui'
import { Model, OpencodeChatService } from '../../shared/opencode'

@Component({
  selector: 'app-model-selector',
  imports: [SelectorComponent, ModelNameComponent, PrimeTemplate],
  templateUrl: './model-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelSelectorComponent {
  private opencodeChat = inject(OpencodeChatService)

  readonly visible = input.required<boolean>()

  providerModelsOptions = computed(() => {
    const providers = this.opencodeChat.providers.providers()
    if (!providers) {
      return []
    }

    const providerModels: SelectorItem<Model>[] = []
    for (const provider of providers.providers) {
      for (const model of Object.values(provider.models)) {
        providerModels.push({
          id: provider.id + '-' + model.id,
          label: provider.name + ' ' + model.name,
          data: {
            providerID: provider.id,
            providerName: provider.name,
            modelID: model.id,
            modelName: model.name,
          },
        })
      }
    }

    return providerModels.sort((a, b) => {
      // First sort by provider name
      const providerCompare = a.data.providerName.localeCompare(b.data.providerName)
      if (providerCompare !== 0) {
        return providerCompare
      }
      // Then sort by model name within the same provider
      return a.data.modelName.localeCompare(b.data.modelName)
    })
  })

  select(model: Model) {
    this.opencodeChat.providers.setNextPromptModel(model)
  }

  hide() {
    this.opencodeChat.providers.closeModelSelector()
  }
}
