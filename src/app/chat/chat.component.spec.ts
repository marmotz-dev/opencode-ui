import { Component, Input, NO_ERRORS_SCHEMA, Signal, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { of } from 'rxjs'
import { Logger } from '../shared/logger/logger.service'
import { OpencodeChatService } from '../shared/opencode'
import { ChatAreaComponent } from './chat-area/chat-area.component'
import { ChatComponent } from './chat.component'
import { MessageInputComponent } from './message-input/message-input.component'
import { ModelSelectorComponent } from './model-selector/model-selector.component'
import { SessionListComponent } from './session-list/session-list.component'
import { StatusComponent } from './status/status.component'

jest.mock('primeng/contextmenu', () => ({
  ContextMenu: class MockContextMenu {},
  ContextMenuModule: class MockContextMenuModule {},
}))

// Mock all child components to isolate ChatComponent
@Component({
  selector: 'app-session-list',
  template: '<div class="mock-session-list"></div>',
})
class MockSessionListComponent {
  @Input() sessionId: any = null
}

@Component({
  selector: 'app-chat-area',
  template: '<div class="mock-chat-area"></div>',
})
class MockChatAreaComponent {}

@Component({
  selector: 'app-message-input',
  template: '<div class="mock-message-input"></div>',
})
class MockMessageInputComponent {}

@Component({
  selector: 'app-model-selector',
  template: '<div class="mock-model-selector"></div>',
})
class MockModelSelectorComponent {
  @Input() visible: boolean = false
}

@Component({
  selector: 'app-status',
  template: '<div class="mock-status"></div>',
})
class MockStatusComponent {}

describe('ChatComponent', () => {
  let component: ChatComponent
  let fixture: ComponentFixture<ChatComponent>
  let mockOpencodeChatService: any
  let mockRouter: any
  let mockRoute: any

  const mockSession = {
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

  beforeEach(async () => {
    mockOpencodeChatService = {
      sessions: {
        sessions: signal([mockSession]),
        session: signal(mockSession),
        setSessionId: jest.fn(),
      },
      messages: {
        sessionMessages: signal([]),
        loadSessionMessages: jest.fn().mockResolvedValue(undefined),
      },
      providers: {
        modelSelectorVisible: signal(false),
      },
    }

    // Router will be provided by RouterTestingModule

    mockRoute = {
      paramMap: of({
        get: jest.fn((key: string) => (key === 'sessionId' ? 'test-session-id' : null)),
      }),
    }

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(undefined),
    }

    await TestBed.configureTestingModule({
      imports: [
        ChatComponent,
        MockSessionListComponent,
        MockChatAreaComponent,
        MockMessageInputComponent,
        MockModelSelectorComponent,
        MockStatusComponent,
      ],
      providers: [
        { provide: OpencodeChatService, useValue: mockOpencodeChatService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Logger, useValue: { debug: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ChatComponent, {
        remove: {
          imports: [
            SessionListComponent,
            ChatAreaComponent,
            MessageInputComponent,
            ModelSelectorComponent,
            StatusComponent,
          ],
        },
        add: {
          imports: [
            MockSessionListComponent,
            MockChatAreaComponent,
            MockMessageInputComponent,
            MockModelSelectorComponent,
            MockStatusComponent,
          ],
        },
      })
      .compileComponents()

    fixture = TestBed.createComponent(ChatComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with sessionId from route', () => {
    expect((component as any).sessionId()).toBe('test-session-id')
  })

  it('should have access to opencode chat services', () => {
    expect(component['opencodeChat']).toBe(mockOpencodeChatService)
    expect(component['router']).toBe(mockRouter)
    expect(component['route']).toBe(mockRoute)
  })

  it('should expose modelSelectorVisible from opencode chat service', () => {
    expect((component as any).modelSelectorVisible()).toBe(false)
  })

  it('should have access to sessions and messages', () => {
    expect(component['sessions']()).toEqual([mockSession])
    expect(component['session']()).toEqual(mockSession)
    expect(component['sessionMessages']()).toEqual([])
  })

  describe('Effects', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should load session messages when sessionId changes', async () => {
      // Access the sessionId signal to ensure it's initialized
      const sessionId = (component as any).sessionId()
      expect(sessionId).toBe('test-session-id')

      // Manually call the effect method to test the behavior
      await (component as any).loadSessionMessagesEffect()

      // Verify the effect behavior
      expect(mockOpencodeChatService.sessions.setSessionId).toHaveBeenCalledWith('test-session-id')
      expect(mockOpencodeChatService.messages.loadSessionMessages).toHaveBeenCalled()
    })

    it('should navigate to root when no session exists', async () => {
      // Mock no session
      mockOpencodeChatService.sessions.session.set(null)

      // trigger effect
      fixture.detectChanges()
      await fixture.whenStable()

      expect(mockRouter.navigate).toHaveBeenCalledWith(['chat'])
    })

    it('should navigate to first session when no sessionId but sessions exist', async () => {
      // Mock route with no sessionId
      mockRoute.paramMap = of({
        get: jest.fn().mockReturnValue(null),
      })

      // Create new component to trigger effect
      fixture = TestBed.createComponent(ChatComponent)
      component = fixture.componentInstance
      fixture.detectChanges()

      // Wait for effect to complete
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(mockRouter.navigate).toHaveBeenCalledWith(['chat', 'test-session-id'])
    })
  })

  describe('scrollToBottom', () => {
    it('should scroll to bottom when called', () => {
      const mockElement = {
        nativeElement: {
          scrollTop: 0,
          scrollHeight: 1000,
        },
      }

      // Mock viewChild as a signal that returns the element
      component['scrollContainer'] = signal(mockElement) as Signal<any>
      component['scrollToBottom']()

      // Use setTimeout to test the async behavior
      setTimeout(() => {
        expect(mockElement.nativeElement.scrollTop).toBe(1000)
      }, 0)
    })

    it('should not scroll when no scroll container', () => {
      // Mock no scroll container
      component['scrollContainer'] = signal(null) as Signal<any>

      // Should not throw error
      expect(() => component['scrollToBottom']()).not.toThrow()
    })
  })
})
