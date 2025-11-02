import { TestBed } from '@angular/core/testing'

import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { ProjectsService } from './projects.service'

describe('ProjectsService', () => {
  let service: ProjectsService
  let mockOpencodeApiService: any
  let mockLogger: any

  const mockProject = {
    id: 'test-project-id',
    name: 'Test Project',
    directory: '/test/project',
    description: 'A test project',
  }

  beforeEach(() => {
    mockOpencodeApiService = {
      getProjects: jest.fn(),
    } as any

    mockLogger = {
      debug: jest.fn(),
    } as any

    TestBed.configureTestingModule({
      providers: [
        ProjectsService,
        { provide: OpencodeApiService, useValue: mockOpencodeApiService },
        { provide: Logger, useValue: mockLogger },
      ],
    })

    service = TestBed.inject(ProjectsService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with null projects', () => {
    expect(service.projects()).toBeNull()
  })

  describe('loadProjects', () => {
    it('should load projects from API', async () => {
      const mockProjects = [mockProject]
      mockOpencodeApiService.getProjects.mockResolvedValue({ data: mockProjects })

      await service.loadProjects()

      expect(service.projects()).toEqual(mockProjects)
      expect(mockOpencodeApiService.getProjects).toHaveBeenCalled()
    })

    it('should handle empty response', async () => {
      mockOpencodeApiService.getProjects.mockResolvedValue({ data: [] })

      await service.loadProjects()

      expect(service.projects()).toEqual([])
    })

    it('should handle null data', async () => {
      mockOpencodeApiService.getProjects.mockResolvedValue({ data: null })

      await service.loadProjects()

      expect(service.projects()).toEqual([])
    })
  })
})
