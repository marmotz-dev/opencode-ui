import {
  Agent,
  AssistantMessage,
  BadRequestError,
  Config,
  Message,
  NotFoundError,
  Project as OriginalProject,
  Part,
  Path,
  Provider,
  Session,
} from '@opencode-ai/sdk/client'

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

export type ProviderData = {
  providers: Provider[]
  default: {
    [p: string]: string
  }
}

export type Model = {
  providerID: string
  providerName: string
  modelID: string
  modelName: string
}

export type Project = OriginalProject & {
  name: string
}

type OpencodeResponse<T, E> =
  | ({ data: T; error: undefined } & { request: Request; response: Response })
  | ({ data: undefined; error: E } & { request: Request; response: Response })

export type GetAgentsResponse = OpencodeResponse<Agent[], unknown>
export type GetConfigResponse = OpencodeResponse<Config, unknown>
export type GetCurrentProjectResponse = OpencodeResponse<Project, unknown>
export type GetPathResponse = OpencodeResponse<Path, unknown>
export type GetProjectsResponse = OpencodeResponse<Project[], unknown>
export type GetProvidersResponse = OpencodeResponse<ProviderData, unknown>

export type CreateSessionResponse = OpencodeResponse<Session, BadRequestError>
export type DeleteSessionResponse = OpencodeResponse<boolean, BadRequestError | NotFoundError>
export type GetSessionsResponse = OpencodeResponse<Session[], unknown>

export type GetSessionMessagesResponse = OpencodeResponse<SessionMessage[], BadRequestError | NotFoundError>

export type PromptResponse = OpencodeResponse<SessionAssistantMessage, BadRequestError | NotFoundError>
