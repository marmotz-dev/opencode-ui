import { TestBed } from '@angular/core/testing'

import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { AgentsService } from './agents.service'

describe('AgentsService', () => {
  let service: AgentsService
  let mockOpencodeApiService: any
  let mockLogger: any

  beforeEach(() => {
    mockOpencodeApiService = {
      getAgents: jest.fn(),
    } as any

    mockLogger = {
      debug: jest.fn(),
    } as any

    TestBed.configureTestingModule({
      providers: [
        AgentsService,
        { provide: OpencodeApiService, useValue: mockOpencodeApiService },
        { provide: Logger, useValue: mockLogger },
      ],
    })

    service = TestBed.inject(AgentsService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with null agents', () => {
    expect(service.agents()).toBeNull()
  })

  describe('loadAgents', () => {
    it('should load agents from API', async () => {
      const mockAgents = [{ name: 'Test Agent' }] as any[]
      mockOpencodeApiService.getAgents.mockResolvedValue({ data: mockAgents })

      await service.loadAgents()

      expect(service.agents()).toEqual(mockAgents)
      expect(mockOpencodeApiService.getAgents).toHaveBeenCalled()
    })

    it('should handle empty response', async () => {
      mockOpencodeApiService.getAgents.mockResolvedValue({ data: [] })

      await service.loadAgents()

      expect(service.agents()).toEqual([])
    })

    it('should handle null data', async () => {
      mockOpencodeApiService.getAgents.mockResolvedValue({ data: null })

      await service.loadAgents()

      expect(service.agents()).toEqual([])
    })
  })
})
