import { TestBed } from '@angular/core/testing'
import { ElectronService } from '../../core/services'
import { Logger } from '../logger/logger.service'
import { OpencodeApiService } from './opencode-api.service'

describe('OpencodeApiService', () => {
  let service: OpencodeApiService
  let mockElectronService: any

  beforeEach(() => {
    mockElectronService = {
      ipcRenderer: {
        invoke: jest.fn(),
        on: jest.fn(),
      },
    }

    TestBed.configureTestingModule({
      providers: [
        OpencodeApiService,
        { provide: ElectronService, useValue: mockElectronService },
        { provide: Logger, useValue: { debug: jest.fn(), warn: jest.fn() } },
      ],
    })

    service = TestBed.inject(OpencodeApiService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should create session', async () => {
    const mockResponse = { data: 'session' }
    mockElectronService.ipcRenderer.invoke.mockResolvedValue(mockResponse)

    const result = await service.createSession()

    expect(mockElectronService.ipcRenderer.invoke).toHaveBeenCalledWith('opencode.session.create')
    expect(result).toBe(mockResponse)
  })

  it('should get agents', async () => {
    const mockResponse = { data: [] }
    mockElectronService.ipcRenderer.invoke.mockResolvedValue(mockResponse)

    const result = await service.getAgents()

    expect(mockElectronService.ipcRenderer.invoke).toHaveBeenCalledWith('opencode.agents.get')
    expect(result).toBe(mockResponse)
  })

  it('should prompt', async () => {
    const mockResponse = { data: 'response' }
    mockElectronService.ipcRenderer.invoke.mockResolvedValue(mockResponse)
    const model = { providerID: 'openai', modelID: 'gpt-4', providerName: 'OpenAI', modelName: 'GPT-4' }

    const result = await service.prompt('session1', 'message', model)

    expect(mockElectronService.ipcRenderer.invoke).toHaveBeenCalledWith(
      'opencode.session.prompt',
      'session1',
      'message',
      { providerID: 'openai', modelID: 'gpt-4' }
    )
    expect(result).toBe(mockResponse)
  })

  it('should register event callback', () => {
    const callback = jest.fn()
    service.onEvent('message.updated', callback)

    expect(service['eventCallbacks'].get('message.updated')).toContain(callback)
  })
})
