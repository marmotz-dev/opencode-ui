import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { OpencodeChatService } from '../opencode'

export const ipcReadyGuard: CanActivateFn = () => {
  const opencodeChatService = inject(OpencodeChatService)
  const router = inject(Router)

  const isIpcReady = opencodeChatService.isIpcReady()

  if (!isIpcReady) {
    localStorage.setItem('redirectUrl', window.location.toString())
    router.navigate(['loading'])
  }

  return isIpcReady
}
