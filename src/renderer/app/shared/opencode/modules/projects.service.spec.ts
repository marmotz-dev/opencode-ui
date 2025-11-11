import { TestBed } from '@angular/core/testing'

import { ElectronService } from '../..'
import { Logger } from '../../logger/logger.service'
import { OpencodeApiService } from '../opencode-api.service'
import { ProjectsService } from './projects.service'

describe('ProjectsService', () => {
  let service: ProjectsService
  let mockOpencodeApiService: any
  let mockLogger: any
  let closeAppSpy: jest.SpyInstance

  const mockProject = {
    id: 'test-project-id',
    name: 'Test Project',
    worktree: '/test/project',
    time: { created: Date.now() },
  }

  beforeEach(() => {
    mockOpencodeApiService = {
      getProjects: jest.fn(),
    } as any

    mockLogger = {
      debug: jest.fn(),
    } as any

    // Spy on ElectronService.closeApp
    closeAppSpy = jest.spyOn(ElectronService, 'closeApp').mockImplementation(() => Promise.resolve())

    TestBed.configureTestingModule({
      providers: [
        ProjectsService,
        { provide: OpencodeApiService, useValue: mockOpencodeApiService },
        { provide: Logger, useValue: mockLogger },
      ],
    })

    service = TestBed.inject(ProjectsService)
  })

  afterEach(() => {
    closeAppSpy.mockRestore()
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

  describe('closeProjectSelector', () => {
    beforeEach(() => {
      // Reset the spy before each test
      closeAppSpy.mockClear()
      // Set project selector as visible initially
      service.openProjectSelector()
    })

    it('should close project selector', () => {
      service.closeProjectSelector()

      expect(service.projectSelectorVisible()).toBe(false)
    })

    it('should close app when no current project is set', () => {
      // Ensure no current project
      expect(service.currentProject()).toBeNull()

      service.closeProjectSelector()

      expect(closeAppSpy).toHaveBeenCalledTimes(1)
    })

    it('should not close app when current project is set', () => {
      // Set a current project
      service.setCurrentProject(mockProject)

      service.closeProjectSelector()

      expect(closeAppSpy).not.toHaveBeenCalled()
    })

    it('should close project selector regardless of current project status', () => {
      // Test with no current project
      service.closeProjectSelector()
      expect(service.projectSelectorVisible()).toBe(false)

      // Reset selector visibility
      service.openProjectSelector()
      expect(service.projectSelectorVisible()).toBe(true)

      // Test with current project
      service.setCurrentProject(mockProject)
      service.closeProjectSelector()
      expect(service.projectSelectorVisible()).toBe(false)
    })
  })
})
