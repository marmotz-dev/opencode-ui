import { BadRequestError, Message, NotFoundError, Part, Session } from '@opencode-ai/sdk/client'

export type SessionMessage = {
  info: Message
  parts: Part[]
}

export type PartTime = {
  start: number
  end?: number
}

type OpencodeResponse<T, E> =
  | ({ data: T; error: undefined } & { request: Request; response: Response })
  | ({ data: undefined; error: E } & { request: Request; response: Response })

export type GetSessionsResponse = OpencodeResponse<Session[], unknown>
export type CreateSessionResponse = OpencodeResponse<Session, BadRequestError>
export type GetSessionMessagesResponse = OpencodeResponse<SessionMessage[], BadRequestError | NotFoundError>
