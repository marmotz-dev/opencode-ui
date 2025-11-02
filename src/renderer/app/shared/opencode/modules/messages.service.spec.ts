import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'

import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { Model, SessionMessage } from '../opencode.types'
import { MessagesService } from './messages.service'
import { ProvidersService } from './providers.service'
import { SessionsService } from './sessions.service'

describe('MessagesService', () => {
  let service: MessagesService
  let mockOpencodeApiService: any
  let mockProvidersService: any
  let mockSessionsService: any
  let mockLogger: any

  const mockModel: Model = {
    providerID: 'test-provider',
    providerName: 'Test Provider',
    modelID: 'test-model',
    modelName: 'Test Model',
  }

  const mockSessionMessage: SessionMessage = {
    info: {
      id: 'test-message-id',
      sessionID: 'test-session-id',
      role: 'user',
      time: {
        created: Date.now(),
      },
    },
    parts: [],
  }

  beforeEach(() => {
    mockOpencodeApiService = {
      getSessionMessages: jest.fn(),
      prompt: jest.fn(),
      onEvent: jest.fn(),
    } as any

    mockProvidersService = {
      nextPromptModel: signal(null),
      getProviderByIds: jest.fn(),
      providers: signal(null),
      lastChosenPromptModel: signal(null),
    } as any

    mockSessionsService = {
      sessionId: jest.fn(),
      createSession: jest.fn(),
    } as any

    mockLogger = {
      debug: jest.fn(),
    } as any

    TestBed.configureTestingModule({
      providers: [
        MessagesService,
        { provide: OpencodeApiService, useValue: mockOpencodeApiService },
        { provide: ProvidersService, useValue: mockProvidersService },
        { provide: SessionsService, useValue: mockSessionsService },
        { provide: Logger, useValue: mockLogger },
      ],
    })

    service = TestBed.inject(MessagesService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with empty sessions messages', () => {
    expect(service.sessionsMessages()).toEqual({})
  })

  it('should return null sessionMessages when no sessionId', () => {
    mockSessionsService.sessionId.mockReturnValue(null)
    expect(service.sessionMessages()).toBeNull()
  })

  it('should return sessionMessages for current session', () => {
    const sessionId = 'test-session-id'
    const messages = [mockSessionMessage]

    service['_sessionsMessages'].set({ [sessionId]: messages })
    mockSessionsService.sessionId.mockReturnValue(sessionId)

    expect(service.sessionMessages()).toEqual(messages)
  })

  it('should return nextPromptModel when available', () => {
    mockProvidersService.nextPromptModel.set(mockModel)
    expect(service.currentModel()).toBe(mockModel)
  })

  it('should return lastChosenPromptModel when no messages', () => {
    mockProvidersService.nextPromptModel.set(null)
    mockProvidersService.lastChosenPromptModel.set(mockModel)
    mockProvidersService.getProviderByIds.mockReturnValue(mockModel)
    mockSessionsService.sessionId.mockReturnValue('test-session')
    service['_sessionsMessages'].set({})

    expect(service.currentModel()).toBe(mockModel)
  })

  it('should return default provider when no messages and no last chosen', () => {
    mockProvidersService.nextPromptModel.set(null)
    mockProvidersService.lastChosenPromptModel.set(null)
    mockProvidersService.providers.set({
      providers: [],
      default: { 'test-provider': 'test-model' },
    })
    mockProvidersService.getProviderByIds.mockReturnValue(mockModel)
    mockSessionsService.sessionId.mockReturnValue('test-session')
    service['_sessionsMessages'].set({})

    expect(service.currentModel()).toBe(mockModel)
  })

  it('should load session messages', async () => {
    const sessionId = 'test-session-id'
    const messages = [mockSessionMessage]

    mockSessionsService.sessionId.mockReturnValue(sessionId)
    mockOpencodeApiService.getSessionMessages.mockResolvedValue({ data: messages, error: undefined } as any)

    await service.loadSessionMessages()

    expect(service.sessionsMessages()[sessionId]).toEqual(messages)
    expect(mockOpencodeApiService.getSessionMessages).toHaveBeenCalledWith(sessionId)
  })

  it('should not load messages when no sessionId', async () => {
    mockSessionsService.sessionId.mockReturnValue(null)

    await service.loadSessionMessages()

    expect(mockOpencodeApiService.getSessionMessages).not.toHaveBeenCalled()
  })

  it('should prompt with existing session', async () => {
    const sessionId = 'test-session-id'
    const message = 'Hello, world!'

    mockSessionsService.sessionId.mockReturnValue(sessionId)
    mockProvidersService.nextPromptModel.set(mockModel)
    mockOpencodeApiService.prompt.mockResolvedValue(undefined)

    await service.prompt(message)

    expect(mockSessionsService.createSession).not.toHaveBeenCalled()
    expect(mockOpencodeApiService.prompt).toHaveBeenCalledWith(sessionId, message, mockModel)
  })

  it('should create new session when no sessionId', async () => {
    const message = 'Hello, world!'
    const newSession = {
      id: 'new-session-id',
      projectID: '',
      directory: '',
      title: '',
      version: '',
      time: { created: Date.now(), updated: Date.now() },
    }

    mockSessionsService.sessionId.mockReturnValueOnce(null).mockReturnValueOnce('new-session-id')
    mockSessionsService.createSession.mockResolvedValue(newSession)
    mockProvidersService.nextPromptModel.set(mockModel)
    mockOpencodeApiService.prompt.mockResolvedValue({ data: undefined, error: undefined } as any)

    await service.prompt(message)

    expect(mockSessionsService.createSession).toHaveBeenCalled()
    expect(mockOpencodeApiService.prompt).toHaveBeenCalledWith('new-session-id', message, mockModel)
  })

  it('should throw error when unable to create session', async () => {
    mockSessionsService.sessionId.mockReturnValue(null)
    mockSessionsService.createSession.mockResolvedValue(undefined)

    await expect(service.prompt('test')).rejects.toThrow('Unable to create session')
  })

  it('should remove session messages', () => {
    const sessionId = 'test-session-id'
    const messages = [mockSessionMessage]

    service['_sessionsMessages'].set({ [sessionId]: messages })
    service.removeSessionMessages(sessionId)

    expect(service.sessionsMessages()[sessionId]).toBeUndefined()
  })

  it('should handle message updated event', () => {
    const sessionId = 'test-session-id'
    const event: any = {
      type: 'message.updated',
      properties: {
        info: {
          id: 'test-message-id',
          sessionID: sessionId,
          role: 'user',
          time: { created: Date.now() },
        },
      },
    }

    service['_sessionsMessages'].set({ [sessionId]: [] })
    service['onMessageUpdated'](event)

    expect(service.sessionsMessages()[sessionId]).toHaveLength(1)
    expect(service.sessionsMessages()[sessionId][0].info.id).toBe('test-message-id')
  })

  it('should handle message removed event', () => {
    const sessionId = 'test-session-id'
    const messages = [mockSessionMessage]

    service['_sessionsMessages'].set({ [sessionId]: messages })

    const event: any = {
      type: 'message.removed',
      properties: {
        sessionID: sessionId,
        messageID: 'test-message-id',
      },
    }

    service['onMessageRemoved'](event)

    expect(service.sessionsMessages()[sessionId]).toEqual([])
  })

  it('should handle message part updated event', () => {
    const sessionId = 'test-session-id'
    const messageId = 'test-message-id'
    const part: any = {
      id: 'test-part-id',
      type: 'text',
      text: 'Test content',
      time: { start: Date.now() },
    }

    service['_sessionsMessages'].set({
      [sessionId]: [
        {
          info: mockSessionMessage.info,
          parts: [],
        },
      ],
    })

    const event: any = {
      type: 'message.part.updated',
      properties: {
        part: {
          ...part,
          sessionID: sessionId,
          messageID: messageId,
        },
      },
    }

    service['onMessagePartUpdated'](event)

    const resultPart = service.sessionsMessages()[sessionId][0].parts.find((p: any) => p.id === part.id)
    expect(resultPart).toBeDefined()
    expect((resultPart as any).text).toBe(part.text)
  })

  it('should handle session deleted event', () => {
    const sessionId = 'test-session-id'
    const messages = [mockSessionMessage]

    service['_sessionsMessages'].set({ [sessionId]: messages })

    const event: any = {
      type: 'session.deleted',
      properties: {
        info: { id: sessionId, projectID: '', directory: '', title: '', version: '', time: { created: 0, updated: 0 } },
      },
    }

    service['onSessionDeleted'](event)

    expect(service.sessionsMessages()[sessionId]).toBeUndefined()
  })
})
