import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { PrimeTemplate } from 'primeng/api'
import { ModelNameComponent } from '../../shared/components/model-name/model-name.component'
import { SelectorComponent, SelectorItem } from '../../shared/components/selector/selector.component'
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

    return providerModels
  })

  select(model: Model) {
    this.opencodeChat.providers.setNextPromptModel(model)
  }

  hide() {
    this.opencodeChat.providers.closeModelSelector()
  }
}
