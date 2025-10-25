import { createOpencode, OpencodeClient } from '@opencode-ai/sdk'
import { BrowserWindow } from 'electron'
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

  getCurrentSessions() {
    return this.client.session.list()
  }

  getProjects() {
    return this.client.project.list()
  }

  getCurrentProject() {
    return this.client.project.current()
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
