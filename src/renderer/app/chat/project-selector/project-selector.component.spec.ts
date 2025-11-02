import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { OpencodeChatService } from '../../shared/opencode'
import { ProjectSelectorComponent } from './project-selector.component'

describe('ProjectSelectorComponent', () => {
  let component: ProjectSelectorComponent
  let fixture: ComponentFixture<ProjectSelectorComponent>
  let mockOpencodeChatService: any

  const mockProjects = [
    { id: '1', worktree: '/path/to/project1', name: 'project1', time: { created: Date.now() } },
    { id: '2', worktree: '/path/to/project2', name: 'project2', time: { created: Date.now() } },
  ]

  beforeEach(async () => {
    mockOpencodeChatService = {
      projects: {
        projects: signal(mockProjects),
        getProjectName: jest.fn((project: any) => project.worktree.split('/').pop()),
        setCurrentProject: jest.fn(),
        closeProjectSelector: jest.fn(),
      },
    }

    await TestBed.configureTestingModule({
      imports: [ProjectSelectorComponent],
      providers: [{ provide: OpencodeChatService, useValue: mockOpencodeChatService }],
    }).compileComponents()

    fixture = TestBed.createComponent(ProjectSelectorComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('visible', false)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should compute project items', () => {
    const items = component.projectItemsOptions()
    expect(items).toHaveLength(2)
    expect(items[0].label).toBe('project1')
    expect(items[1].label).toBe('project2')
  })

  it('should handle select', () => {
    const mockProject = { id: '1', worktree: '/path/to/project', name: 'project', time: { created: Date.now() } }

    component.select(mockProject)

    expect(mockOpencodeChatService.projects.setCurrentProject).toHaveBeenCalledWith(mockProject)
  })

  it('should handle hide', () => {
    component.hide()

    expect(mockOpencodeChatService.projects.closeProjectSelector).toHaveBeenCalled()
  })
})
