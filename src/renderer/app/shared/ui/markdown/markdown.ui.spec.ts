import { HttpClientModule } from '@angular/common/http'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MarkdownModule } from 'ngx-markdown'

import { MarkdownUi } from './markdown.ui'

describe('MarkdownUi', () => {
  let component: MarkdownUi
  let fixture: ComponentFixture<MarkdownUi>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownUi, HttpClientModule, MarkdownModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(MarkdownUi)
    component = fixture.componentInstance
  })

  it('should create', () => {
    fixture.componentRef.setInput('data', '# Hello')
    fixture.detectChanges()

    expect(component).toBeTruthy()
  })
})
