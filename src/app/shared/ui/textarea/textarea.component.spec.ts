import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RmUiTextareaComponent } from './textarea.component'

describe('TextareaComponent', () => {
  let component: RmUiTextareaComponent
  let fixture: ComponentFixture<RmUiTextareaComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RmUiTextareaComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(RmUiTextareaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should update value on input event', () => {
    const textarea = fixture.nativeElement.querySelector('textarea')
    textarea.value = 'new value'
    textarea.dispatchEvent(new Event('input'))
    fixture.detectChanges()
    expect(component.value).toBe('new value')
  })

  it('should set textarea height to minHeight if less than minHeight on resize', () => {
    jest.spyOn(component.textarea().nativeElement, 'scrollHeight', 'get').mockImplementation(() => 50)
    component.autoResize = true
    component.autoResizeMinHeight = 100
    fixture.detectChanges()

    const textarea = fixture.nativeElement.querySelector('textarea')
    textarea.dispatchEvent(new Event('input'))

    expect(textarea.style.height).toBe('100px')
  })

  it('should set textarea height to maxHeight if more than maxHeight on resize', () => {
    jest.spyOn(component.textarea().nativeElement, 'scrollHeight', 'get').mockImplementation(() => 250)
    component.autoResize = true
    component.autoResizeMaxHeight = 200
    fixture.detectChanges()

    const textarea = fixture.nativeElement.querySelector('textarea')
    textarea.dispatchEvent(new Event('input'))

    expect(textarea.style.height).toBe('200px')
  })

  it('should not auto resize if autoResize is false', () => {
    jest.spyOn(component.textarea().nativeElement, 'scrollHeight', 'get').mockImplementation(() => 123)
    component.autoResize = false

    const textarea = fixture.nativeElement.querySelector('textarea')
    textarea.dispatchEvent(new Event('input'))

    expect(textarea.style.height).toBe('')
  })

  afterEach(() => {
    fixture.destroy()
  })
})
