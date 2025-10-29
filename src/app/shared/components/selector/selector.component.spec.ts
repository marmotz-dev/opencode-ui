import { CommonModule } from '@angular/common'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { PrimeTemplate } from 'primeng/api'
import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { InputText } from 'primeng/inputtext'
import { ListboxModule } from 'primeng/listbox'
import { SelectorComponent } from './selector.component'

describe('SelectorComponent', () => {
  let component: SelectorComponent<any>
  let fixture: ComponentFixture<SelectorComponent<any>>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SelectorComponent,
        DialogModule,
        ListboxModule,
        ButtonModule,
        InputText,
        FormsModule,
        PrimeTemplate,
      ],
      providers: [...provideNoopAnimations()],
    }).compileComponents()

    fixture = TestBed.createComponent(SelectorComponent<any>)
    component = fixture.componentInstance

    fixture.componentRef.setInput('visible', true)
    fixture.componentRef.setInput('items', [
      { id: '1', label: 'Item 1', data: { id: '1', label: 'Item 1' } },
      { id: '2', label: 'Item 2', data: { id: '2', label: 'Item 2' } },
    ])
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should filter items based on search terms', () => {
    component.searchTerms.set('Item 1')
    fixture.detectChanges()

    const filteredItems = component.filteredItems()
    expect(filteredItems).toHaveLength(1)
    expect(filteredItems[0].label).toBe('Item 1')
  })

  it('should emit selected item', () => {
    jest.spyOn(component.selected, 'emit')
    const item = { id: '1', label: 'Item 1', data: { id: '1', label: 'Item 1' } }

    component.select(item)

    expect(component.selected.emit).toHaveBeenCalledWith(item.data)
  })
})
