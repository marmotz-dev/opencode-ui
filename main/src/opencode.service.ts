import { createOpencode, OpencodeClient } from '@opencode-ai/sdk'
import { BrowserWindow } from 'electron'
import { ProjectHydrator } from './hydrators/project.hydrator.js'
import { Model } from './opencode.types.js'

export class OpencodeService {
  private constructor(
    private readonly client: OpencodeClient,
    private readonly server: { close: () => void },
    private window: BrowserWindow
  ) {
    this.listenEvents()
  }

  static async init(window: BrowserWindow) {
    const { client, server } = await createOpencode()

    return new OpencodeService(client, server, window)
  }

  closeServer() {
    this.server.close()
  }

  createSession() {
    return this.client.session.create()
  }

  deleteSession(sessionId: string) {
    return this.client.session.delete({
      path: {
        id: sessionId,
      },
    })
  }

  getConfig() {
    return this.client.config.get()
  }

  getAgents() {
    return this.client.app.agents()
  }

  getProjectSessions(projectPath: string) {
    return this.client.session.list({
      query: {
        directory: projectPath,
      },
    })
  }

  async getProjects() {
    return ProjectHydrator.hydrateProjectsResponse(await this.client.project.list())
  }

  async getCurrentProject() {
    return { data: null }
  }

  getPath() {
    return this.client.path.get()
  }

  getProviders() {
    return this.client.config.providers()
  }

  getSessionMessages(sessionId: string) {
    return this.client.session.messages({
      path: {
        id: sessionId,
      },
    })
  }

  async listenEvents() {
    const events = await this.client.event.subscribe()

    for await (const event of events.stream) {
      console.log(`New opencode event :`, event)
      this.window.webContents.send('opencode.event', event)
    }
  }

  prompt(sessionId: string, message: string, model?: Model) {
    return this.client.session.prompt({
      path: {
        id: sessionId,
      },
      body: {
        model,
        parts: [
          {
            type: 'text',
            text: message,
          },
        ],
      },
    })
  }
}
