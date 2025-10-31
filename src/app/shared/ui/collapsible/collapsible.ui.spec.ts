import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FaIconLibrary } from '@fortawesome/angular-fontawesome'

import { IconUi } from '../icon/icon.ui'
import { CollapsibleUi } from './collapsible.ui'

describe('CollapsibleUi', () => {
  let component: CollapsibleUi
  let fixture: ComponentFixture<CollapsibleUi>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapsibleUi, IconUi],
      providers: [
        {
          provide: FaIconLibrary,
          useValue: {
            addIcons: jest.fn(),
            getIconDefinition: jest.fn().mockReturnValue({
              prefix: 'fas',
              iconName: 'chevron-up',
              icon: [0, 0, [], [], ''],
            }),
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(CollapsibleUi)
    component = fixture.componentInstance
  })

  it('should create', () => {
    fixture.componentRef.setInput('header', 'Test Header')
    fixture.detectChanges()

    expect(component).toBeTruthy()
  })

  it('should start collapsed by default', () => {
    fixture.componentRef.setInput('header', 'Test Header')
    fixture.detectChanges()

    const contentDiv = fixture.nativeElement.querySelector('.collapsible')
    expect(contentDiv.classList.contains('open')).toBe(true) // collapse = true means opened = true initially
  })

  it('should toggle opened state', () => {
    fixture.componentRef.setInput('header', 'Test Header')
    fixture.detectChanges()

    const contentDiv = fixture.nativeElement.querySelector('.collapsible')
    const initial = contentDiv.classList.contains('open')
    component.toggle()
    fixture.detectChanges()
    expect(contentDiv.classList.contains('open')).toBe(!initial)
  })
})
