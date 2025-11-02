import { HttpClientModule } from '@angular/common/http'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TextPart } from '@opencode-ai/sdk/client'
import { MarkdownModule } from 'ngx-markdown'

import { MarkdownUi } from '../../../../shared/ui/markdown/markdown.ui'
import { RelativeTimePipe } from '../../pipes/relative-time.pipe'
import { TextPartComponent } from './text-part.component'

describe('TextPartComponent', () => {
  let component: TextPartComponent
  let fixture: ComponentFixture<TextPartComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextPartComponent, RelativeTimePipe, MarkdownUi, HttpClientModule, MarkdownModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(TextPartComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    const mockMessage = {
      id: '1',
      time: { created: Date.now() },
      role: 'assistant',
    } as any
    const mockPart: TextPart = {
      id: '1',
      sessionID: '1',
      messageID: '1',
      type: 'text',
      text: 'Hello world',
    }

    fixture.componentRef.setInput('info', mockMessage)
    fixture.componentRef.setInput('part', mockPart)
    fixture.detectChanges()

    expect(component).toBeTruthy()
  })
})
