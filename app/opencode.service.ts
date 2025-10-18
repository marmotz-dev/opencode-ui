import { createOpencode, OpencodeClient } from '@opencode-ai/sdk'
import { ipcMain } from 'electron'

export class OpencodeService {
  private constructor(private readonly client: OpencodeClient) {
    this.listenEvents()
  }

  static async init() {
    const { client } = await createOpencode()

    return new OpencodeService(client)
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
    const events = await this.client.event.subscribe({})

    for await (const event of events.stream) {
      ipcMain.emit('opencode.event', event)
      console.log(`Opencode event:`, event)
    }
  }
}
