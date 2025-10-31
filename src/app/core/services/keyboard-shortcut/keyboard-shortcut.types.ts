export type KeyboardKeys = {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

export type KeyboardShortcut = KeyboardKeys & {
  action: () => void
  description: string
  preventDefault?: boolean
}

export type KeyboardShortcutConfig = {
  [key: string]: KeyboardShortcut
}
