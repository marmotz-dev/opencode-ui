import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Model } from '../../shared/opencode'

import { ModelNameComponent } from './model-name.component'

describe('ModelNameComponent', () => {
  let component: ModelNameComponent
  let fixture: ComponentFixture<ModelNameComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelNameComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ModelNameComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    const mockModel: Model = {
      providerID: 'openai',
      providerName: 'OpenAI',
      modelID: 'gpt-4',
      modelName: 'GPT-4',
    }

    fixture.componentRef.setInput('model', mockModel)
    fixture.detectChanges()

    expect(component).toBeTruthy()
  })

  it('should display model name and provider', () => {
    const mockModel: Model = {
      providerID: 'openai',
      providerName: 'OpenAI',
      modelID: 'gpt-4',
      modelName: 'GPT-4',
    }

    fixture.componentRef.setInput('model', mockModel)
    fixture.detectChanges()

    const compiled = fixture.nativeElement
    expect(compiled.textContent).toContain('GPT-4')
    expect(compiled.textContent).toContain('OpenAI')
  })
})
