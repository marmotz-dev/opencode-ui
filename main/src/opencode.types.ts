import { Project as OriginalProject } from '@opencode-ai/sdk'

export type Model = {
  providerID: string
  modelID: string
}

export type Project = OriginalProject & {
  name: string
}
