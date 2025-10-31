import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { OpencodeChatService } from '../opencode'
import { KeyboardShortcutService } from './keyboard-shortcut.service'
import { KeyboardShortcut } from './keyboard-shortcut.types'

describe('KeyboardShortcutService', () => {
  let service: KeyboardShortcutService
  let mockRouter: any
  let mockOpencodeChat: any
  let mockSessionsService: any
  let mockProvidersService: any
  let mockProjectsService: any

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn(),
    }

    mockSessionsService = {
      getNextSession: jest.fn(),
      getPeviousSession: jest.fn(),
    }

    mockProvidersService = {
      openModelSelector: jest.fn(),
      closeModelSelector: jest.fn(),
    }

    mockProjectsService = {
      openProjectSelector: jest.fn(),
      closeProjectSelector: jest.fn(),
    }

    mockOpencodeChat = {
      sessions: mockSessionsService,
      providers: mockProvidersService,
      projects: mockProjectsService,
    }

    TestBed.configureTestingModule({
      providers: [
        KeyboardShortcutService,
        { provide: Router, useValue: mockRouter },
        { provide: OpencodeChatService, useValue: mockOpencodeChat },
      ],
    })

    service = TestBed.inject(KeyboardShortcutService)
  })

  afterEach(() => {
    // Clean up any event listeners added during tests
    jest.restoreAllMocks()

    // Restore original navigator.platform if it was modified
    Object.defineProperty(navigator, 'platform', {
      value: 'Linux x86_64',
      writable: true,
    })
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('registerShortcut', () => {
    it('should register a shortcut with correct key generation', () => {
      const shortcut: KeyboardShortcut = {
        key: 'a',
        ctrl: true,
        action: jest.fn(),
        description: 'Test shortcut',
      }

      service.registerShortcut(shortcut)

      // Access private property for testing
      const shortcuts = (service as any).shortcuts
      expect(shortcuts['ctrl+a']).toBe(shortcut)
    })

    it('should handle multiple modifiers', () => {
      const shortcut: KeyboardShortcut = {
        key: 'b',
        ctrl: true,
        shift: true,
        alt: true,
        action: jest.fn(),
        description: 'Test shortcut',
      }

      service.registerShortcut(shortcut)

      const shortcuts = (service as any).shortcuts
      expect(shortcuts['ctrl+shift+alt+b']).toBe(shortcut)
    })

    it('should convert key to lowercase', () => {
      const shortcut: KeyboardShortcut = {
        key: 'A',
        ctrl: true,
        action: jest.fn(),
        description: 'Test shortcut',
      }

      service.registerShortcut(shortcut)

      const shortcuts = (service as any).shortcuts
      expect(shortcuts['ctrl+a']).toBe(shortcut)
    })
  })

  describe('generateShortcutKey', () => {
    it('should generate correct key for ctrl modifier', () => {
      const result = (service as any).generateShortcutKey({ key: 'a', ctrl: true })
      expect(result).toBe('ctrl+a')
    })

    it('should generate correct key for multiple modifiers', () => {
      const result = (service as any).generateShortcutKey({
        key: 'b',
        ctrl: true,
        shift: true,
        alt: true,
        meta: true,
      })
      expect(result).toBe('ctrl+shift+alt+meta+b')
    })

    it('should handle modifiers in consistent order', () => {
      const result1 = (service as any).generateShortcutKey({
        key: 'c',
        meta: true,
        ctrl: true,
        shift: true,
      })
      const result2 = (service as any).generateShortcutKey({
        key: 'c',
        shift: true,
        ctrl: true,
        meta: true,
      })
      expect(result1).toBe(result2)
    })
  })

  describe('init', () => {
    it('should call registerDefaultShortcuts and startListening', () => {
      const registerSpy = jest.spyOn(service as any, 'registerDefaultShortcuts')
      const startSpy = jest.spyOn(service as any, 'startListening')

      service.init()

      expect(registerSpy).toHaveBeenCalled()
      expect(startSpy).toHaveBeenCalled()
    })

    it('should register all default shortcuts', () => {
      service.init()

      const shortcuts = (service as any).shortcuts
      const isMac = (service as any).isMac
      const primaryModifier = isMac ? 'meta' : 'ctrl'

      // Check that all expected shortcuts are registered
      expect(shortcuts[`${primaryModifier}+tab`]).toBeDefined()
      expect(shortcuts[`${primaryModifier}+shift+tab`]).toBeDefined()
      expect(shortcuts[`${primaryModifier}+shift+m`]).toBeDefined()
      expect(shortcuts[`${primaryModifier}+shift+p`]).toBeDefined()
      expect(shortcuts[`${primaryModifier}+l`]).toBeDefined()

      // Verify shortcut properties
      expect(shortcuts[`${primaryModifier}+tab`].description).toBe('Navigate to next session')
      expect(shortcuts[`${primaryModifier}+shift+tab`].description).toBe('Navigate to previous session')
      expect(shortcuts[`${primaryModifier}+shift+m`].description).toBe('Show model selector')
      expect(shortcuts[`${primaryModifier}+shift+p`].description).toBe('Show project selector')
      expect(shortcuts[`${primaryModifier}+l`].description).toBe('Focus message input')
    })
  })

  describe('startListening', () => {
    it('should add keydown event listener', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')

      ;(service as any).startListening()

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect((service as any).isListening).toBe(true)
    })

    it('should not add listener if already listening', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')

      // First call to start listening
      ;(service as any).startListening()

      // Reset spy to check second call
      addEventListenerSpy.mockClear()

      // Second call should not add listener
      ;(service as any).startListening()

      expect(addEventListenerSpy).not.toHaveBeenCalled()
    })
  })

  describe('handleKeyDown', () => {
    let mockEvent: KeyboardEvent
    let preventDefaultSpy: jest.SpyInstance

    beforeEach(() => {
      mockEvent = {
        key: 'a',
        ctrlKey: true,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
        target: document.createElement('div'),
      } as any
      preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault')
    })

    it('should handle textarea elements correctly', () => {
      const textareaElement = document.createElement('textarea')
      const textareaEvent = {
        ...mockEvent,
        target: textareaElement,
      } as KeyboardEvent

      const actionSpy = jest.fn()
      const shortcut: KeyboardShortcut = {
        key: 'a',
        ctrl: true,
        action: actionSpy,
        description: 'Test shortcut',
      }
      service.registerShortcut(shortcut)

      ;(service as any).handleKeyDown(textareaEvent)

      // Should execute registered shortcuts even in textarea
      expect(actionSpy).toHaveBeenCalled()
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should handle contentEditable elements correctly', () => {
      const divElement = document.createElement('div')
      divElement.contentEditable = 'true'
      const editableEvent = {
        ...mockEvent,
        target: divElement,
      } as KeyboardEvent

      const actionSpy = jest.fn()
      const shortcut: KeyboardShortcut = {
        key: 'a',
        ctrl: true,
        action: actionSpy,
        description: 'Test shortcut',
      }
      service.registerShortcut(shortcut)

      ;(service as any).handleKeyDown(editableEvent)

      // Should execute registered shortcuts even in contentEditable
      expect(actionSpy).toHaveBeenCalled()
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should ignore unknown shortcuts in input fields', () => {
      const inputElement = document.createElement('input')
      const inputEvent = {
        ...mockEvent,
        key: 'z', // Different key not registered
        target: inputElement,
      } as KeyboardEvent

      const actionSpy = jest.fn()
      const shortcut: KeyboardShortcut = {
        key: 'a',
        ctrl: true,
        action: actionSpy,
        description: 'Test shortcut',
      }
      service.registerShortcut(shortcut)

      ;(service as any).handleKeyDown(inputEvent)

      // Should not execute unregistered shortcuts in input fields
      expect(actionSpy).not.toHaveBeenCalled()
      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('should execute registered shortcut and prevent default behavior when preventDefault is not false', () => {
      const actionSpy = jest.fn()
      const shortcut: KeyboardShortcut = {
        key: 'a',
        ctrl: true,
        action: actionSpy,
        description: 'Test shortcut',
      }

      service.registerShortcut(shortcut)

      ;(service as any).handleKeyDown(mockEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(actionSpy).toHaveBeenCalled()
    })

    it('should execute registered shortcut without preventing default when preventDefault is explicitly false', () => {
      const actionSpy = jest.fn()
      const shortcut: KeyboardShortcut = {
        key: 'a',
        ctrl: true,
        action: actionSpy,
        description: 'Test shortcut',
        preventDefault: false,
      }

      service.registerShortcut(shortcut)

      ;(service as any).handleKeyDown(mockEvent)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
      expect(actionSpy).toHaveBeenCalled()
    })

    it('should ignore unregistered shortcuts in input fields', () => {
      const actionSpy = jest.fn()
      const inputElement = document.createElement('input')
      const inputEvent = {
        ...mockEvent,
        target: inputElement,
      } as KeyboardEvent

      // Register a shortcut that's not for the pressed key
      const shortcut: KeyboardShortcut = {
        key: 'b',
        ctrl: true,
        action: actionSpy,
        description: 'Test shortcut',
      }
      service.registerShortcut(shortcut)

      ;(service as any).handleKeyDown(inputEvent)

      expect(actionSpy).not.toHaveBeenCalled()
    })

    it('should execute registered shortcuts even in input fields', () => {
      const actionSpy = jest.fn()
      const inputElement = document.createElement('input')
      const inputEvent = {
        ...mockEvent,
        target: inputElement,
      } as KeyboardEvent

      const shortcut: KeyboardShortcut = {
        key: 'a',
        ctrl: true,
        action: actionSpy,
        description: 'Test shortcut',
      }
      service.registerShortcut(shortcut)

      ;(service as any).handleKeyDown(inputEvent)

      expect(actionSpy).toHaveBeenCalled()
    })
  })

  describe('navigation methods', () => {
    it('should navigate to next session when session exists', async () => {
      const mockSession = { id: 'session-1' }
      mockSessionsService.getNextSession.mockReturnValue(mockSession)

      await (service as any).navigateToNextSession()

      expect(mockRouter.navigate).toHaveBeenCalledWith(['chat', 'session-1'])
    })

    it('should not navigate when no next session', async () => {
      mockSessionsService.getNextSession.mockReturnValue(null)

      await (service as any).navigateToNextSession()

      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })

    it('should navigate to previous session when session exists', async () => {
      const mockSession = { id: 'session-2' }
      mockSessionsService.getPeviousSession.mockReturnValue(mockSession)

      await (service as any).navigateToPreviousSession()

      expect(mockRouter.navigate).toHaveBeenCalledWith(['chat', 'session-2'])
    })

    it('should not navigate when no previous session', async () => {
      mockSessionsService.getPeviousSession.mockReturnValue(null)

      await (service as any).navigateToPreviousSession()

      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('selector methods', () => {
    it('should open model selector', () => {
      ;(service as any).showModelSelector()

      expect(mockProvidersService.openModelSelector).toHaveBeenCalled()
    })

    it('should open project selector', () => {
      ;(service as any).showProjectSelector()

      expect(mockProjectsService.openProjectSelector).toHaveBeenCalled()
    })
  })

  describe('focusMessageInput', () => {
    it('should focus textarea and set cursor at end when textarea exists', () => {
      const mockTextarea = document.createElement('textarea')
      mockTextarea.value = 'existing text'
      document.body.appendChild(mockTextarea)

      // Mock querySelector to return our textarea
      const querySelectorSpy = jest.spyOn(document, 'querySelector')
      querySelectorSpy.mockReturnValue(mockTextarea)

      const focusSpy = jest.spyOn(mockTextarea, 'focus')
      const setSelectionRangeSpy = jest.spyOn(mockTextarea, 'setSelectionRange')

      ;(service as any).focusMessageInput()

      expect(focusSpy).toHaveBeenCalled()
      expect(setSelectionRangeSpy).toHaveBeenCalledWith(13, 13) // Length of 'existing text'

      // Cleanup
      document.body.removeChild(mockTextarea)
      querySelectorSpy.mockRestore()
    })

    it('should do nothing when textarea does not exist', () => {
      const querySelectorSpy = jest.spyOn(document, 'querySelector')
      querySelectorSpy.mockReturnValue(null)

      expect(() => {
        ;(service as any).focusMessageInput()
      }).not.toThrow()

      querySelectorSpy.mockRestore()
    })
  })

})