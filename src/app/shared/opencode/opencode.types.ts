import { AssistantMessage, BadRequestError, Message, NotFoundError, Part, Session } from '@opencode-ai/sdk/client'

export type SessionMessage = {
  info: Message
  parts: Part[]
}

export type SessionAssistantMessage = {
  info: AssistantMessage
  parts: Part[]
}

export type PartTime = {
  start: number
  end?: number
}

type OpencodeResponse<T, E> =
  | ({ data: T; error: undefined } & { request: Request; response: Response })
  | ({ data: undefined; error: E } & { request: Request; response: Response })

export type CreateSessionResponse = OpencodeResponse<Session, BadRequestError>
export type DeleteSessionResponse = OpencodeResponse<boolean, BadRequestError | NotFoundError>
export type GetSessionMessagesResponse = OpencodeResponse<SessionMessage[], BadRequestError | NotFoundError>
export type GetSessionsResponse = OpencodeResponse<Session[], unknown>
export type PromptResponse = OpencodeResponse<SessionAssistantMessage, BadRequestError | NotFoundError>
