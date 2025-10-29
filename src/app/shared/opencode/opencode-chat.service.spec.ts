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
    }
    mockSessionsService = {
      setCurrentProject: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        OpencodeChatService,
        { provide: AgentsService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: MessagesService, useValue: {} },
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: ProvidersService, useValue: {} },
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

  it('should set current project on sessions when project changes', () => {
    const project = { name: 'test' }
    mockProjectsService.currentProject.set(project)

    // Wait for effect
    setTimeout(() => {
      expect(mockSessionsService.setCurrentProject).toHaveBeenCalledWith(project)
    }, 0)
  })
})
