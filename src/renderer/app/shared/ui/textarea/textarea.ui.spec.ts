import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TextareaModule } from 'primeng/textarea'

import { TextareaUi } from './textarea.ui'

describe('TextareaUi', () => {
  let component: TextareaUi
  let fixture: ComponentFixture<TextareaUi>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaUi, TextareaModule],
    }).compileComponents()

    fixture = TestBed.createComponent(TextareaUi)
    component = fixture.componentInstance
  })

  it('should create', () => {
    fixture.detectChanges()

    expect(component).toBeTruthy()
  })

  it('should bind value', () => {
    component.value.set('Test value')
    fixture.detectChanges()

    const textarea = fixture.nativeElement.querySelector('textarea')
    expect(textarea.value).toBe('Test value')
  })

  it('should update value on input', () => {
    fixture.detectChanges()

    const textarea = fixture.nativeElement.querySelector('textarea')
    textarea.value = 'New value'
    textarea.dispatchEvent(new Event('input'))

    expect(component.value()).toBe('New value')
  })
})
