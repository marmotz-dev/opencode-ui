export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
}

export interface KeyboardShortcutConfig {
  [key: string]: KeyboardShortcut
}
