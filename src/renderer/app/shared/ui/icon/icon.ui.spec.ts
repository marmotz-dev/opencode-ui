import { ComponentFixture, TestBed } from '@angular/core/testing'
import { faHome } from '@fortawesome/free-solid-svg-icons'

import { IconUi } from './icon.ui'

describe('IconUi', () => {
  let component: IconUi
  let fixture: ComponentFixture<IconUi>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconUi],
    }).compileComponents()

    fixture = TestBed.createComponent(IconUi)
    component = fixture.componentInstance

    fixture.componentRef.setInput('name', faHome)

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
