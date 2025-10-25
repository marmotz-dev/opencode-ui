import { effect, inject, Injectable, signal } from '@angular/core'
import { Project } from '@opencode-ai/sdk/client'
import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'

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

  constructor() {
    effect(() => Promise.all([this.loadProjects(), this.loadCurrentProject()]))
  }

  async loadProjects() {
    const response = await this.opencodeApi.getProjects()
    const projects = response.data ?? []

    this.logger.debug('loadProjects', projects)

    this._projects.set(projects)
  }

  async loadCurrentProject() {
    const response = await this.opencodeApi.getCurrentProject()
    const currentProject = response.data ?? null

    this.logger.debug('loadCurrentProject', currentProject)

    this._currentProject.set(currentProject)
  }
}
