import { createOpencode, OpencodeClient } from '@opencode-ai/sdk'
import { BrowserWindow } from 'electron'
import { ProjectHydrator } from './hydrators/project.hydrator.js'
import { Model } from './opencode.types.js'

export class OpencodeService {
  private constructor(
    private readonly client: OpencodeClient,
    private readonly server: { close: () => void },
    private mainWindow: BrowserWindow
  ) {
    this.listenEvents()
  }

  static async init(mainWindow: BrowserWindow) {
    const { client, server } = await createOpencode()

    return new OpencodeService(client, server, mainWindow)
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

  renameSession(sessionId: string, newName: string) {
    return this.client.session.update({
      path: {
        id: sessionId,
      },
      body: {
        title: newName,
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
      this.mainWindow.webContents.send('opencode.event', event)
    }
  }

  prompt(sessionId: string, message: string, model: Model) {
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
