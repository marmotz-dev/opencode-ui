import { TestBed } from '@angular/core/testing'

import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { ConfigService } from './config.service'

describe('ConfigService', () => {
  let service: ConfigService
  let mockOpencodeApiService: any
  let mockLogger: any

  const mockConfig = {
    model: 'test-model',
    temperature: 0.7,
    maxTokens: 1000,
  }

  beforeEach(() => {
    mockOpencodeApiService = {
      getConfig: jest.fn(),
    } as any

    mockLogger = {
      debug: jest.fn(),
    } as any

    TestBed.configureTestingModule({
      providers: [
        ConfigService,
        { provide: OpencodeApiService, useValue: mockOpencodeApiService },
        { provide: Logger, useValue: mockLogger },
      ],
    })

    service = TestBed.inject(ConfigService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with null config', () => {
    expect(service.config()).toBeNull()
  })

  describe('loadConfig', () => {
    it('should load config from API', async () => {
      mockOpencodeApiService.getConfig.mockResolvedValue({ data: mockConfig })

      await service.loadConfig()

      expect(service.config()).toEqual(mockConfig)
      expect(mockOpencodeApiService.getConfig).toHaveBeenCalled()
    })

    it('should handle null data', async () => {
      mockOpencodeApiService.getConfig.mockResolvedValue({ data: null })

      await service.loadConfig()

      expect(service.config()).toBeNull()
    })
  })
})
