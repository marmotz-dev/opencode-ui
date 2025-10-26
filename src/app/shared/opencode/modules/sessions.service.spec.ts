import { TestBed } from '@angular/core/testing'
import { Session } from '@opencode-ai/sdk/client'
import { of } from 'rxjs'

import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { SessionsService } from './sessions.service'

describe('SessionsService', () => {
  let service: SessionsService
  let mockOpencodeApiService: any
  let mockLogger: any

  const mockSession: Session = {
    id: 'test-session-id',
    projectID: 'test-project',
    directory: '/test',
    title: 'Test Session',
    version: '1.0.0',
    time: {
      created: Date.now(),
      updated: Date.now(),
    },
  }

  beforeEach(() => {
    mockOpencodeApiService = {
      getSessions: jest.fn(),
      createSession: jest.fn(),
      deleteSession: jest.fn(),
      onEvent: jest.fn(),
    }
    mockLogger = {
      debug: jest.fn(),
    }
    mockLogger = {
      debug: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        SessionsService,
        { provide: OpencodeApiService, useValue: mockOpencodeApiService },
        { provide: Logger, useValue: mockLogger },
      ],
    })

    service = TestBed.inject(SessionsService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with null sessions', () => {
    expect(service.sessions()).toBeNull()
  })

  it('should initialize with null sessionId', () => {
    expect(service.sessionId()).toBeNull()
  })

  it('should return null session when no sessions exist', () => {
    expect(service.session()).toBeNull()
  })

  it('should return correct session when sessionId matches', () => {
    mockOpencodeApiService.getSessions.mockReturnValue(of({ data: [mockSession] }))

    service.setSessionId('test-session-id')

    // Manually set sessions to test the computed property
    service['_sessions'].set([mockSession])

    expect(service.session()).toEqual(mockSession)
  })

  it('should set sessionId correctly', () => {
    service.setSessionId('new-session-id')
    expect(service.sessionId()).toBe('new-session-id')
  })

  it('should not update sessionId if same value', () => {
    service.setSessionId('test-id')
    const initialCalls = mockLogger.debug.mock.calls.length

    service.setSessionId('test-id')

    expect(mockLogger.debug.mock.calls.length).toBe(initialCalls)
  })

  it('should create session successfully', async () => {
    mockOpencodeApiService.createSession.mockResolvedValue({ data: mockSession })

    const result = await service.createSession()

    expect(result).toEqual(mockSession)
    expect(mockOpencodeApiService.createSession).toHaveBeenCalled()
  })

  it('should delete session and update sessions list', async () => {
    const sessions = [mockSession, { ...mockSession, id: 'session-2' }]
    mockOpencodeApiService.deleteSession.mockResolvedValue(undefined)

    // Set initial sessions
    service['_sessions'].set(sessions)
    service.setSessionId('test-session-id')

    const result = await service.deleteSession('test-session-id')

    expect(result).toBe('session-2')
    expect(service.sessions()).toEqual([{ ...mockSession, id: 'session-2' }])
    expect(service.sessionId()).toBe('session-2')
  })

  it('should delete session and select previous when no next session', async () => {
    const sessions = [{ ...mockSession, id: 'session-1' }, mockSession]
    mockOpencodeApiService.deleteSession.mockResolvedValue(undefined)

    service['_sessions'].set(sessions)
    service.setSessionId('test-session-id')

    const result = await service.deleteSession('test-session-id')

    expect(result).toBe('session-1')
    expect(service.sessionId()).toBe('session-1')
  })

  it('should delete session and set null when no more sessions', async () => {
    mockOpencodeApiService.deleteSession.mockResolvedValue(undefined)

    service['_sessions'].set([mockSession])
    service.setSessionId('test-session-id')

    const result = await service.deleteSession('test-session-id')

    expect(result).toBeNull()
    expect(service.sessionId()).toBeNull()
  })

  it('should load sessions from API', async () => {
    const sessions = [mockSession]
    mockOpencodeApiService.getSessions.mockResolvedValue({ data: sessions })

    await service.loadSessions()

    expect(service.sessions()).toEqual(sessions)
    expect(mockOpencodeApiService.getSessions).toHaveBeenCalled()
  })

  it('should handle session updated event', () => {
    const updatedSession = { ...mockSession, time: { ...mockSession.time, updated: Date.now() } }
    const event = {
      type: 'session.updated' as const,
      properties: {
        info: updatedSession,
      },
    }

    service['_sessions'].set([mockSession])
    service['onSessionUpdated'](event)

    expect(service.sessions()).toEqual([updatedSession])
  })

  it('should add new session on updated event if not exists', () => {
    const event = {
      type: 'session.updated' as const,
      properties: {
        info: mockSession,
      },
    }

    service['_sessions'].set([])
    service['onSessionUpdated'](event)

    expect(service.sessions()).toEqual([mockSession])
  })

  it('should handle session deleted event', () => {
    const event = {
      type: 'session.deleted' as const,
      properties: {
        info: {
          id: 'test-session-id',
          projectID: '',
          directory: '',
          title: '',
          version: '',
          time: { created: 0, updated: 0 },
        },
      },
    }

    service['_sessions'].set([mockSession])
    service['_sessionId'].set('test-session-id')

    service['onSessionDeleted'](event)

    expect(service.sessions()).toEqual([])
    expect(service.sessionId()).toBeNull()
  })
})
