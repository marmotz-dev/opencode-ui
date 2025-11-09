// jest.setup.js
import { ElectronService } from './src/renderer/app/shared'

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
})

// Mock ElectronService static methods
jest.spyOn(ElectronService, 'getIpcRenderer').mockReturnValue({
  invoke: jest.fn(),
  on: jest.fn(),
  once: jest.fn(),
  off: jest.fn(),
  send: jest.fn(),
})

jest.spyOn(ElectronService, 'getWebFrame').mockReturnValue({
  setZoomFactor: jest.fn(),
  getZoomFactor: jest.fn(),
})

jest.spyOn(ElectronService, 'isDev').mockReturnValue(false)

jest.spyOn(ElectronService, 'selectDirectory').mockResolvedValue(null)
