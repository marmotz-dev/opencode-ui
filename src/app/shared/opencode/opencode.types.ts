import { Message, Part } from '@opencode-ai/sdk/client'

export type SessionMessage = {
  info: Message
  parts: Part[]
}

export type PartTime = {
  start: number
  end?: number
}
