import { createOpencode, OpencodeClient } from '@opencode-ai/sdk'
import { BrowserWindow } from 'electron'

export class OpencodeService {
  private constructor(
    private readonly client: OpencodeClient,
    private readonly window: BrowserWindow
  ) {
    this.listenEvents()
  }

  static async init(window: BrowserWindow) {
    const { client } = await createOpencode()

    return new OpencodeService(client, window)
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

  getCurrentSessions() {
    return this.client.session.list()
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
      this.window.webContents.send('opencode.event', event)
      console.log(`Opencode event:`, event)
    }
  }

  prompt(sessionId: string, message: string) {
    return this.client.session.prompt({
      path: {
        id: sessionId,
      },
      body: {
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
