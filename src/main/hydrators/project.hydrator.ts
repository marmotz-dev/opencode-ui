import { Project as OpencodeProject } from '@opencode-ai/sdk/client'

export class ProjectHydrator {
  static hydrateProjectsResponse(response: { data?: OpencodeProject[] }) {
    if (!response.data) {
      return response
    }

    return {
      ...response,
      data: response.data.map((project: OpencodeProject) => this.hydrateProject(project)),
    }
  }

  static hydrateProjectResponse(response: { data?: OpencodeProject }) {
    if (!response.data) {
      return response
    }

    return {
      ...response,
      data: this.hydrateProject(response.data),
    }
  }

  static hydrateProject(project: OpencodeProject) {
    return {
      ...project,
      name: project.worktree.split('/').pop(),
    }
  }
}
