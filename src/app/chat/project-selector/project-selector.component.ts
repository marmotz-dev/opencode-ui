import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { PrimeTemplate } from 'primeng/api'
import { Button } from 'primeng/button'
import { ElectronService } from '../../core/services'
import { SelectorComponent, SelectorItem } from '../../shared/components/selector/selector.component'
import { OpencodeChatService, Project } from '../../shared/opencode'

@Component({
  selector: 'app-project-selector',
  imports: [SelectorComponent, PrimeTemplate, Button],
  templateUrl: './project-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSelectorComponent {
  private opencodeChat = inject(OpencodeChatService)
  private electronService = inject(ElectronService)

  readonly visible = input.required<boolean>()

  projectItemsOptions = computed(() => {
    const projects = this.opencodeChat.projects.projects()
    if (!projects) {
      return []
    }

    return projects
      .map((project) => ({
        id: project.id,
        label: project.name,
        data: project,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) satisfies SelectorItem<Project>[]
  })

  select(project: Project) {
    this.opencodeChat.projects.setCurrentProject(project)
  }

  hide() {
    this.opencodeChat.projects.closeProjectSelector()
  }

  protected async createProject() {
    const projectPath = await this.electronService.selectDirectory()
    if (!projectPath) {
      return
    }

    this.opencodeChat.projects.setCurrentProject({
      id: '',
      name: projectPath.split('/').pop() ?? '',
      worktree: projectPath,
      time: {
        created: Date.now(),
      },
    })

    this.hide()
  }
}
