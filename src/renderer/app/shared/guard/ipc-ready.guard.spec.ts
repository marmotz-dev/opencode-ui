import { TestBed } from '@angular/core/testing'
import { CanActivateFn, Router } from '@angular/router'
import { OpencodeChatService } from '../opencode'

import { ipcReadyGuard } from './ipc-ready.guard'

describe('ipcReadyGuard', () => {
  let opencodeChatServiceSpy: any
  let routerSpy: any
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => ipcReadyGuard(...guardParameters))

  beforeEach(() => {
    const opencodeChatSpy = {
      isIpcReady: jest.fn(),
    }
    const routerSpyObj = {
      navigate: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        { provide: OpencodeChatService, useValue: opencodeChatSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
    })

    opencodeChatServiceSpy = TestBed.inject(OpencodeChatService)
    routerSpy = TestBed.inject(Router)
  })

  it('should be created', () => {
    expect(executeGuard).toBeTruthy()
  })

  it('should return true when IPC is ready', () => {
    opencodeChatServiceSpy.isIpcReady.mockReturnValue(true)

    const result = executeGuard(null as any, null as any)

    expect(result).toBe(true)
    expect(routerSpy.navigate).not.toHaveBeenCalled()
  })

  it('should return false and navigate to loading when IPC is not ready', () => {
    opencodeChatServiceSpy.isIpcReady.mockReturnValue(false)

    const result = executeGuard(null as any, null as any)

    expect(result).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith('redirectUrl', window.location.toString())
    expect(routerSpy.navigate).toHaveBeenCalledWith(['loading'])
  })
})
