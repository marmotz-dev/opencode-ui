import { createOpencode, OpencodeClient } from '@opencode-ai/sdk'

export class OpencodeService {
  private client?: OpencodeClient

  private async getClient() {
    if (!this.client) {
      const { client } = await createOpencode()

      this.client = client
    }

    return this.client
  }

  async getCurrentSessions() {
    return (await this.getClient()).session.list()
  }

  async getSessionMessages(sessionId: string) {
    return (await this.getClient()).session.messages({
      path: {
        id: sessionId,
      },
    })
  }

  async deleteSession(sessionId: string) {
    return (await this.getClient()).session.delete({
      path: {
        id: sessionId,
      },
    })
  }

  async createSession() {
    return (await this.getClient()).session.create()
  }
}
