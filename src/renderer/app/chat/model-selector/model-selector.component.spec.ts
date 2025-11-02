import { Component, Input, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'

import { ModelNameComponent } from '../model-name/model-name.component'
import { Model, OpencodeChatService } from '../../shared/opencode'
import { ModelSelectorComponent } from './model-selector.component'

// Mock ModelNameComponent to avoid FontAwesome issues
@Component({
  selector: 'app-model-name',
  template: '<span class="mock-model-name">{{model?.modelName}}</span>',
})
class MockModelNameComponent {
  @Input() model: any = null
}

describe('ModelSelectorComponent', () => {
  let component: ModelSelectorComponent
  let fixture: ComponentFixture<ModelSelectorComponent>
  let mockOpencodeChatService: any

  const mockModel: Model = {
    providerID: 'test-provider',
    providerName: 'Test Provider',
    modelID: 'test-model',
    modelName: 'Test Model',
  }

  const mockProviderData = {
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

  beforeEach(async () => {
    mockOpencodeChatService = {
      providers: {
        providers: signal(mockProviderData),
        setNextPromptModel: jest.fn(),
        closeModelSelector: jest.fn(),
      },
    }

    await TestBed.configureTestingModule({
      imports: [ModelSelectorComponent, MockModelNameComponent],
      providers: [{ provide: OpencodeChatService, useValue: mockOpencodeChatService }, provideNoopAnimations()],
    })
      .overrideComponent(ModelSelectorComponent, {
        remove: {
          imports: [ModelNameComponent],
        },
        add: {
          imports: [MockModelNameComponent],
        },
      })
      .compileComponents()

    fixture = TestBed.createComponent(ModelSelectorComponent)
    component = fixture.componentInstance

    // Set required input via fixture
    fixture.componentRef.setInput('visible', true)

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should compute provider models from providers', () => {
    const providerModels = (component as any).providerModelsOptions()

    expect(providerModels).toHaveLength(1)
    expect(providerModels[0].data).toEqual(mockModel)
  })

  it('should return empty array when no providers', () => {
    mockOpencodeChatService.providers.providers.set(null)
    fixture.detectChanges()

    const providerModels = (component as any).providerModelsOptions()

    expect(providerModels).toEqual([])
  })

  describe('select', () => {
    it('should select model', () => {
      component.select(mockModel)

      expect(mockOpencodeChatService.providers.setNextPromptModel).toHaveBeenCalledWith(mockModel)
    })
  })

  describe('hide', () => {
    it('should close model selector', () => {
      component.hide()

      expect(mockOpencodeChatService.providers.closeModelSelector).toHaveBeenCalled()
    })
  })
})
