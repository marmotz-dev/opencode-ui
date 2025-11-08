import { TestBed, waitForAsync } from '@angular/core/testing'

import { ElectronService } from './electron.service'

describe('ElectronService', () => {
  beforeEach(waitForAsync(() => {
    // Mock window.electron
    Object.defineProperty(window, 'electron', {
      value: {
        ipcRenderer: {
          invoke: jest.fn(),
        },
        webFrame: {},
      },
      writable: true,
    })

    TestBed.configureTestingModule({})
  }))

  it('should be created', () => {
    const service: ElectronService = TestBed.inject(ElectronService)
    expect(service).toBeTruthy()
  })
})
