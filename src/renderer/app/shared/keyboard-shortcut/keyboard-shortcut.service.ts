import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { OpencodeChatService } from '../opencode'
import { KeyboardKeys, KeyboardShortcut, KeyboardShortcutConfig } from './keyboard-shortcut.types'

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutService {
  private router = inject(Router)
  private opencodeChat = inject(OpencodeChatService)

  private shortcuts: KeyboardShortcutConfig = {}
  private isListening = false

  // Detect if we're on macOS to use Cmd instead of Ctrl
  private readonly isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  init() {
    this.registerDefaultShortcuts()
    this.startListening()
  }

  private registerDefaultShortcuts() {
    // Use Cmd on Mac, Ctrl on other platforms
    const primaryModifier = this.isMac ? { meta: true } : { ctrl: true }

    this.registerShortcut({
      key: 'Tab',
      ...primaryModifier,
      action: () => this.navigateToNextSession(),
      description: 'Navigate to next session',
    })

    this.registerShortcut({
      key: 'Tab',
      ...primaryModifier,
      shift: true,
      action: () => this.navigateToPreviousSession(),
      description: 'Navigate to previous session',
    })

    this.registerShortcut({
      key: 'm',
      ...primaryModifier,
      shift: true,
      action: () => this.showModelSelector(),
      description: 'Show model selector',
      preventDefault: true,
    })

    this.registerShortcut({
      key: 'p',
      ...primaryModifier,
      shift: true,
      action: () => this.showProjectSelector(),
      description: 'Show project selector',
      preventDefault: true,
    })

    this.registerShortcut({
      key: 'l',
      ...primaryModifier,
      action: () => this.focusMessageInput(),
      description: 'Focus message input',
      preventDefault: true,
    })
  }

  registerShortcut(shortcut: KeyboardShortcut) {
    const key = this.generateShortcutKey(shortcut)
    this.shortcuts[key] = shortcut
  }

  private generateShortcutKey(input: KeyboardKeys): string {
    const modifiers = [
      (input as any).ctrl ? 'ctrl' : '',
      (input as any).shift ? 'shift' : '',
      (input as any).alt ? 'alt' : '',
      (input as any).meta ? 'meta' : '',
    ].filter(Boolean)

    return `${modifiers.join('+')}+${input.key.toLowerCase()}`
  }

  private startListening() {
    if (this.isListening) {
      return
    }

    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    this.isListening = true
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Allow keyboard shortcuts to work even when typing in input fields
    // These shortcuts are for navigation, not text input
    const target = event.target as HTMLElement
    const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true'

    const shortcutKey = this.generateShortcutKey({
      key: event.key,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
    })
    const shortcut = this.shortcuts[shortcutKey]

    // If we're in an input field, only allow our registered shortcuts
    if (isInInput && !shortcut) {
      return
    }

    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault()
      }
      shortcut.action()
    }
  }

  private async navigateToNextSession() {
    const nextSession = this.opencodeChat.sessions.getNextSession()

    if (nextSession) {
      await this.router.navigate(['chat', nextSession.id])
    }
  }

  private async navigateToPreviousSession() {
    const prevSession = this.opencodeChat.sessions.getPeviousSession()

    if (prevSession) {
      await this.router.navigate(['chat', prevSession.id])
    }
  }

  private showModelSelector() {
    this.opencodeChat.providers.openModelSelector()
  }

  private showProjectSelector() {
    this.opencodeChat.projects.openProjectSelector()
  }

  private focusMessageInput() {
    // Find the message input textarea and focus it
    const textarea = document.querySelector('app-message-input textarea') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
      // Move cursor to end
      textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    }
  }
}
