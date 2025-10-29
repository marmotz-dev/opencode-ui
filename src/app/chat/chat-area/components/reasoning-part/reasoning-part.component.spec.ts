import { HttpClientModule } from '@angular/common/http'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FaIconLibrary } from '@fortawesome/angular-fontawesome'
import { AssistantMessage, ReasoningPart } from '@opencode-ai/sdk/client'
import { MarkdownModule } from 'ngx-markdown'

import { CollapsibleUi } from '../../../../shared/ui/collapsible/collapsible.component'
import { MarkdownUi } from '../../../../shared/ui/markdown/markdown.component'
import { PartTimeDurationPipe } from '../../pipes/part-time-duration.pipe'
import { RelativeTimePipe } from '../../pipes/relative-time.pipe'
import { ReasoningPartComponent } from './reasoning-part.component'

describe('ReasoningPartComponent', () => {
  let component: ReasoningPartComponent
  let fixture: ComponentFixture<ReasoningPartComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReasoningPartComponent,
        RelativeTimePipe,
        PartTimeDurationPipe,
        CollapsibleUi,
        MarkdownUi,
        HttpClientModule,
        MarkdownModule.forRoot(),
      ],
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

    fixture = TestBed.createComponent(ReasoningPartComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    const mockMessage = {
      id: '1',
      time: { created: Date.now() },
      role: 'assistant',
    } as AssistantMessage
    const mockPart: ReasoningPart = {
      id: '1',
      sessionID: '1',
      messageID: '1',
      type: 'reasoning',
      text: 'Thinking...',
      time: { start: Date.now(), end: Date.now() },
    }

    fixture.componentRef.setInput('info', mockMessage)
    fixture.componentRef.setInput('part', mockPart)
    fixture.detectChanges()

    expect(component).toBeTruthy()
  })
})
