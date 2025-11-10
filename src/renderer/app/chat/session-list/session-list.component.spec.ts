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
        renameSession: jest.fn(),
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
    expect(component.contextMenuItems).toHaveLength(2)
    expect(component.contextMenuItems[0].label).toBe('Rename')
    expect(component.contextMenuItems[0].icon).toBe('pencil')
    expect(component.contextMenuItems[1].label).toBe('Delete')
    expect(component.contextMenuItems[1].icon).toBe('trash')
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

  describe('renameSession', () => {
    it('should set currentSession and show renamer when session exists', () => {
      component['commandSessionId'].set('test-session-id')

      component.renameSession()

      expect(component['currentSession']()).toEqual(mockSession)
      expect(component['renamerVisible']()).toBe(true)
    })

    it('should not show renamer when sessionId is null', () => {
      component['commandSessionId'].set(null)

      component.renameSession()

      expect(component['currentSession']()).toBeNull()
      expect(component['renamerVisible']()).toBe(false)
    })

    it('should not show renamer when session not found', () => {
      component['commandSessionId'].set('non-existent-id')

      component.renameSession()

      expect(component['currentSession']()).toBeNull()
      expect(component['renamerVisible']()).toBe(false)
    })
  })

  describe('onSessionRenamed', () => {
    it('should rename session and reset currentSession', async () => {
      component['currentSession'].set(mockSession)
      mockOpencodeChatService.sessions.renameSession.mockResolvedValue(undefined)

      await component.onSessionRenamed('New Name')

      expect(mockOpencodeChatService.sessions.renameSession).toHaveBeenCalledWith('test-session-id', 'New Name')
      expect(component['currentSession']()).toBeNull()
    })

    it('should not rename when no currentSession', async () => {
      component['currentSession'].set(null)

      await component.onSessionRenamed('New Name')

      expect(mockOpencodeChatService.sessions.renameSession).not.toHaveBeenCalled()
    })
  })

  describe('hideRenamer', () => {
    it('should hide renamer and reset currentSession', () => {
      component['renamerVisible'].set(true)
      component['currentSession'].set(mockSession)

      component.hideRenamer()

      expect(component['renamerVisible']()).toBe(false)
      expect(component['currentSession']()).toBeNull()
    })
  })
})
