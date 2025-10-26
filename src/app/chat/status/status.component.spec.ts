import { Component, Input, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ButtonModule } from 'primeng/button'

import { ModelNameComponent } from '../../shared/components/model-name/model-name.component'
import { OpencodeChatService } from '../../shared/opencode'
import { IconUi } from '../../shared/ui/icon/icon.ui'
import { StatusComponent } from './status.component'

// Mock IconUi component to avoid FontAwesome issues
@Component({
  selector: 'app-ui-icon',
  template: '<span class="mock-icon"></span>',
})
class MockIconUiComponent {
  @Input() name: string = ''
  @Input() styleClass: string = ''
}

// Mock ModelNameComponent to avoid FontAwesome issues
@Component({
  selector: 'app-model-name',
  template: '<span class="mock-model-name">{{model?.modelName}}</span>',
})
class MockModelNameComponent {
  @Input() model: any = null
}

describe('StatusComponent', () => {
  let component: StatusComponent
  let fixture: ComponentFixture<StatusComponent>
  let mockOpencodeChatService: any

  const mockProject = {
    id: 'test-project',
    name: 'Test Project',
    worktree: '/test/project',
  }

  const mockModel = {
    providerID: 'test-provider',
    providerName: 'Test Provider',
    modelID: 'test-model',
    modelName: 'Test Model',
  }

  beforeEach(async () => {
    mockOpencodeChatService = {
      projects: {
        currentProject: signal(mockProject),
      },
      messages: {
        currentModel: signal(mockModel),
      },
      providers: {
        openModelSelector: jest.fn(),
      },
    }

    await TestBed.configureTestingModule({
      imports: [StatusComponent, ButtonModule, MockIconUiComponent, MockModelNameComponent],
      providers: [{ provide: OpencodeChatService, useValue: mockOpencodeChatService }],
    })
      .overrideComponent(StatusComponent, {
        remove: {
          imports: [IconUi, ModelNameComponent],
        },
        add: {
          imports: [MockIconUiComponent, MockModelNameComponent],
        },
      })
      .compileComponents()

    fixture = TestBed.createComponent(StatusComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should display current project path', () => {
    expect((component as any).currentPath()).toBe('/test/project')
  })

  it('should display null when no current project', () => {
    mockOpencodeChatService.projects.currentProject.set(null)
    fixture.detectChanges()

    expect((component as any).currentPath()).toBeNull()
  })

  it('should display current model', () => {
    expect((component as any).currentModel()).toEqual(mockModel)
  })

  it('should open model selector when called', () => {
    component.openModelSelector()

    expect(mockOpencodeChatService.providers.openModelSelector).toHaveBeenCalled()
  })
})
