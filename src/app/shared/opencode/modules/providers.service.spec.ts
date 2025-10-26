import { TestBed } from '@angular/core/testing'

import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { Model, ProviderData } from '../opencode.types'
import { ProvidersService } from './providers.service'

describe('ProvidersService', () => {
  let service: ProvidersService
  let mockOpencodeApiService: any
  let mockLogger: any

  const mockModel: Model = {
    providerID: 'test-provider',
    providerName: 'Test Provider',
    modelID: 'test-model',
    modelName: 'Test Model',
  }

  const mockProviderData: ProviderData = {
    providers: [
      {
        id: 'test-provider',
        name: 'Test Provider',
        env: [],
        models: {
          'test-model': {
            id: 'test-model',
            name: 'Test Model',
            release_date: '2024-01-01',
            attachment: false,
            reasoning: false,
            temperature: true,
            tool_call: true,
            cost: { input: 1, output: 2 },
            limit: { context: 1000, output: 2000 },
            options: {},
          },
        },
      },
    ],
    default: {
      'test-provider': 'test-model',
    },
  }

  beforeEach(() => {
    mockOpencodeApiService = {
      getProviders: jest.fn(),
    } as any

    mockLogger = {
      debug: jest.fn(),
    } as any

    TestBed.configureTestingModule({
      providers: [
        ProvidersService,
        { provide: OpencodeApiService, useValue: mockOpencodeApiService },
        { provide: Logger, useValue: mockLogger },
      ],
    })

    service = TestBed.inject(ProvidersService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with null providers', () => {
    expect(service.providers()).toBeNull()
  })

  it('should initialize with null nextPromptModel', () => {
    expect(service.nextPromptModel()).toBeNull()
  })

  it('should initialize with null lastChosenPromptModel', () => {
    expect(service.lastChosenPromptModel()).toBeNull()
  })

  it('should initialize with model selector hidden', () => {
    expect(service.modelSelectorVisible()).toBe(false)
  })

  describe('loadProviders', () => {
    it('should load providers from API', async () => {
      mockOpencodeApiService.getProviders.mockResolvedValue({ data: mockProviderData })

      const result = await service.loadProviders()

      expect(service.providers()).toEqual(mockProviderData)
      expect(result).toEqual(mockProviderData)
      expect(mockOpencodeApiService.getProviders).toHaveBeenCalled()
    })

    it('should handle null data', async () => {
      mockOpencodeApiService.getProviders.mockResolvedValue({ data: null })

      await service.loadProviders()

      expect(service.providers()).toEqual({})
    })
  })

  describe('getProviderByIds', () => {
    beforeEach(() => {
      service['_providers'].set(mockProviderData)
    })

    it('should return model when provider and model exist', () => {
      const result = service.getProviderByIds('test-provider', 'test-model')

      expect(result).toEqual(mockModel)
    })

    it('should return null when provider does not exist', () => {
      const result = service.getProviderByIds('non-existent-provider', 'test-model')

      expect(result).toBeNull()
    })

    it('should return null when model does not exist', () => {
      const result = service.getProviderByIds('test-provider', 'non-existent-model')

      expect(result).toBeNull()
    })
  })

  describe('setNextPromptModel', () => {
    it('should set nextPromptModel and lastChosenPromptModel', () => {
      service.setNextPromptModel(mockModel)

      expect(service.nextPromptModel()).toEqual(mockModel)
      expect(service.lastChosenPromptModel()).toEqual(mockModel)
    })
  })

  describe('Model selector visibility', () => {
    it('should open model selector', () => {
      service.openModelSelector()

      expect(service.modelSelectorVisible()).toBe(true)
    })

    it('should close model selector', () => {
      service['_modelSelectorVisible'].set(true)
      service.closeModelSelector()

      expect(service.modelSelectorVisible()).toBe(false)
    })
  })
})
