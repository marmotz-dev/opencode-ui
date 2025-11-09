import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { AgentsService } from './modules/agents.service'
import { ConfigService } from './modules/config.service'
import { MessagesService } from './modules/messages.service'
import { ProjectsService } from './modules/projects.service'
import { ProvidersService } from './modules/providers.service'
import { SessionsService } from './modules/sessions.service'
import { OpencodeChatService } from './opencode-chat.service'

describe('OpencodeChatService', () => {
  let service: OpencodeChatService
  let mockProjectsService: any
  let mockSessionsService: any

  beforeEach(() => {
    mockProjectsService = {
      currentProject: signal(null),
      init: jest.fn().mockResolvedValue(undefined),
    }
    mockSessionsService = {
      setCurrentProject: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        OpencodeChatService,
        { provide: AgentsService, useValue: { init: jest.fn().mockResolvedValue(undefined) } },
        { provide: ConfigService, useValue: { init: jest.fn().mockResolvedValue(undefined) } },
        { provide: MessagesService, useValue: {} },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: ProvidersService, useValue: { init: jest.fn().mockResolvedValue(undefined) } },
        { provide: SessionsService, useValue: mockSessionsService },
      ],
    })

    service = TestBed.inject(OpencodeChatService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should inject services', () => {
    expect(service.agents).toBeDefined()
    expect(service.config).toBeDefined()
    expect(service.messages).toBeDefined()
    expect(service.providers).toBeDefined()
    expect(service.projects).toBeDefined()
    expect(service.sessions).toBeDefined()
  })
})
