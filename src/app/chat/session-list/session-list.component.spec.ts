import { Component, Input, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { Button } from 'primeng/button'

import { ContextMenu } from 'primeng/contextmenu'

import { OpencodeChatService } from '../../shared/opencode'
import { IconUi } from '../../shared/ui/icon/icon.ui'
import { SessionListComponent } from './session-list.component'

// Mock IconUi component to avoid FontAwesome issues
@Component({
  selector: 'app-ui-icon',
  template: '<span class="mock-icon"></span>',
})
class MockIconUiComponent {
  @Input() name: string = ''
  @Input() styleClass: string = ''
}

describe('SessionListComponent', () => {
  let component: SessionListComponent
  let fixture: ComponentFixture<SessionListComponent>
  let mockOpencodeChatService: any
  let mockRouter: any

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
        sessionId: signal('test-session-id'),
        sessions: signal([mockSession]),
        createSession: jest.fn(),
        deleteSession: jest.fn(),
      },
    }

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(undefined),
    }

    await TestBed.configureTestingModule({
      imports: [SessionListComponent, Button, ContextMenu, MockIconUiComponent],
      providers: [
        { provide: OpencodeChatService, useValue: mockOpencodeChatService },
        { provide: Router, useValue: mockRouter },
      ],
    })
      .overrideComponent(SessionListComponent, {
        remove: {
          imports: [IconUi],
        },
        add: {
          imports: [MockIconUiComponent],
        },
      })
      .compileComponents()

    fixture = TestBed.createComponent(SessionListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with sessions and sessionId', () => {
    expect(component.sessions()).toEqual([mockSession])
    expect(component.sessionId()).toBe('test-session-id')
  })

  it('should have context menu items', () => {
    expect(component.contextMenuItems).toHaveLength(1)
    expect(component.contextMenuItems[0].label).toBe('Delete')
    expect(component.contextMenuItems[0].icon).toBe('trash')
  })

  describe('createNewSession', () => {
    it('should create new session and navigate to it', async () => {
      const newSession = { ...mockSession, id: 'new-session-id' }
      mockOpencodeChatService.sessions.createSession.mockResolvedValue(newSession)

      await component.createNewSession()

      expect(mockOpencodeChatService.sessions.createSession).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['chat', 'new-session-id'])
    })

    it('should not navigate if session creation fails', async () => {
      mockOpencodeChatService.sessions.createSession.mockResolvedValue(null)

      await component.createNewSession()

      expect(mockOpencodeChatService.sessions.createSession).toHaveBeenCalled()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('deleteSession', () => {
    it('should delete session and navigate to new session', async () => {
      component['commandSessionId'].set('test-session-id')
      const newSessionId = 'new-session-id'
      mockOpencodeChatService.sessions.deleteSession.mockResolvedValue(newSessionId)

      await component.deleteSession()

      expect(mockOpencodeChatService.sessions.deleteSession).toHaveBeenCalledWith('test-session-id')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['chat', newSessionId])
    })

    it('should not delete if no sessionId', async () => {
      component['commandSessionId'].set(null)

      await component.deleteSession()

      expect(mockOpencodeChatService.sessions.deleteSession).not.toHaveBeenCalled()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('hideContextMenu', () => {
    it('should clear commandSessionId', () => {
      component['commandSessionId'].set('test-session-id')
      component.hideContextMenu()

      expect(component['commandSessionId']()).toBeNull()
    })
  })

  describe('selectSession', () => {
    it('should navigate to selected session', async () => {
      await component.selectSession('test-session-id')

      expect(mockRouter.navigate).toHaveBeenCalledWith(['chat', 'test-session-id'])
    })
  })
})
