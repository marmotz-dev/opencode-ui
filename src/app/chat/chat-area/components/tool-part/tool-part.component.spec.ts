import { HttpClientModule } from '@angular/common/http'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FaIconLibrary } from '@fortawesome/angular-fontawesome'
import { MarkdownModule } from 'ngx-markdown'

import { CollapsibleUi } from '../../../../shared/ui/collapsible/collapsible.component'
import { MarkdownUi } from '../../../../shared/ui/markdown/markdown.component'
import { PartTimeDurationPipe } from '../../pipes/part-time-duration.pipe'
import { RelativeTimePipe } from '../../pipes/relative-time.pipe'
import { ToolPartComponent } from './tool-part.component'

describe('ToolPartComponent', () => {
  let component: ToolPartComponent
  let fixture: ComponentFixture<ToolPartComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ToolPartComponent,
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

    fixture = TestBed.createComponent(ToolPartComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    const mockMessage = {
      id: '1',
      time: { created: Date.now() },
      role: 'assistant',
    } as any
    const mockPart1: any = {
      id: '1',
      sessionID: '1',
      messageID: '1',
      callID: '1',
      type: 'tool',
      tool: 'bash',
      state: {
        status: 'completed',
        input: 'ls',
        output: 'file1.txt\nfile2.txt',
        time: { start: Date.now(), end: Date.now() },
        title: 'Bash command',
        metadata: {},
      },
    }

    fixture.componentRef.setInput('info', mockMessage)
    fixture.componentRef.setInput('part', mockPart1)
    fixture.detectChanges()

    expect(component).toBeTruthy()
  })
})
