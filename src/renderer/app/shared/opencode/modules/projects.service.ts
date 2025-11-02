import { effect, inject, Injectable, signal } from '@angular/core'
import { Path } from '@opencode-ai/sdk/client'
import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { Project } from '../opencode.types'

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private logger = new Logger(ProjectsService.name)
  private opencodeApi = inject(OpencodeApiService)

  private readonly _projects = signal<Project[] | null>(null)
  public projects = this._projects.asReadonly()

  private readonly _currentProject = signal<Project | null>(null)
  public currentProject = this._currentProject.asReadonly()

  private readonly _currentPath = signal<Path | null>(null)
  public currentPath = this._currentPath.asReadonly()

  private _projectSelectorVisible = signal<boolean>(true)
  public projectSelectorVisible = this._projectSelectorVisible.asReadonly()

  constructor() {
    effect(() => Promise.all([this.loadProjects(), this.loadCurrentProject(), this.loadPath()]))
  }

  async loadProjects() {
    const response = await this.opencodeApi.getProjects()
    const projects = (response.data ?? []).filter((project) => project.id !== 'global')

    this.logger.debug('loadProjects', projects)

    this._projects.set(projects)
  }

  async loadCurrentProject() {
    const response = await this.opencodeApi.getCurrentProject()
    const currentProject = response.data ?? null

    this.logger.debug('loadCurrentProject', currentProject)

    this._currentProject.set(currentProject)
  }

  async loadPath() {
    const response = await this.opencodeApi.getPath()
    const currentPath = response.data ?? null

    this.logger.debug('loadPath', currentPath)

    this._currentPath.set(currentPath)
  }

  openProjectSelector() {
    this._projectSelectorVisible.set(true)
  }

  setCurrentProject(project: Project) {
    this._currentProject.set(project)
  }

  closeProjectSelector() {
    this._projectSelectorVisible.set(false)
  }
}
