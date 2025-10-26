import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { ModelNameComponent } from '../../shared/components/model-name/model-name.component'
import { OpencodeChatService } from '../../shared/opencode'
import { IconUi } from '../../shared/ui/icon/icon.ui'

@Component({
  selector: 'app-status',
  imports: [ButtonModule, IconUi, ModelNameComponent],
  templateUrl: './status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponent {
  private readonly opencodeChat = inject(OpencodeChatService)

  protected currentPath = computed(() => {
    const currentProject = this.opencodeChat.projects.currentProject()
    if (!currentProject) {
      return null
    }

    return currentProject.worktree
  })
  protected currentModel = this.opencodeChat.messages.currentModel

  openModelSelector() {
    this.opencodeChat.providers.openModelSelector()
  }
}
