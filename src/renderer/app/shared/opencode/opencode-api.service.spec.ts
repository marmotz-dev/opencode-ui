import { TestBed } from '@angular/core/testing'
import { ElectronService } from '../electron/electron.service'
import { Logger } from '../logger/logger.service'
import { OpencodeApiService } from './opencode-api.service'

describe('OpencodeApiService', () => {
  let service: OpencodeApiService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpencodeApiService, { provide: Logger, useValue: { debug: jest.fn(), warn: jest.fn() } }],
    })

    service = TestBed.inject(OpencodeApiService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should create session', async () => {
    const mockResponse = { data: 'session' }
    const mockIpcRenderer = ElectronService.getIpcRenderer()
    ;(mockIpcRenderer.invoke as jest.Mock).mockResolvedValue(mockResponse)

    const result = await service.createSession()

    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('opencode.session.create')
    expect(result).toBe(mockResponse)
  })

  it('should get agents', async () => {
    const mockResponse = { data: [] }
    const mockIpcRenderer = ElectronService.getIpcRenderer()
    ;(mockIpcRenderer.invoke as jest.Mock).mockResolvedValue(mockResponse)

    const result = await service.getAgents()

    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('opencode.agents.get')
    expect(result).toBe(mockResponse)
  })

  it('should prompt', async () => {
    const mockResponse = { data: 'response' }
    const mockIpcRenderer = ElectronService.getIpcRenderer()
    ;(mockIpcRenderer.invoke as jest.Mock).mockResolvedValue(mockResponse)
    const model = { providerID: 'openai', modelID: 'gpt-4', providerName: 'OpenAI', modelName: 'GPT-4' }

    const result = await service.prompt('session1', 'message', model)

    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('opencode.session.prompt', 'session1', 'message', {
      providerID: 'openai',
      modelID: 'gpt-4',
    })
    expect(result).toBe(mockResponse)
  })

  it('should register event callback', () => {
    const callback = jest.fn()
    service.onEvent('message.updated', callback)

    expect(service['eventCallbacks'].get('message.updated')).toContain(callback)
  })

  it('should rename session', async () => {
    const mockResponse = { data: 'renamed' }
    const mockIpcRenderer = ElectronService.getIpcRenderer()
    ;(mockIpcRenderer.invoke as jest.Mock).mockResolvedValue(mockResponse)

    const result = await service.renameSession('session1', 'New Name')

    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('opencode.session.rename', 'session1', 'New Name')
    expect(result).toBe(mockResponse)
  })
})
