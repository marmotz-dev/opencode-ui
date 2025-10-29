import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'

import { OpencodeChatService } from '../../shared/opencode'
import { ChatAreaComponent } from './chat-area.component'
import { FilterValidPartsPipe } from './pipes/filter-valid-parts.pipe'

describe('ChatAreaComponent', () => {
  let component: ChatAreaComponent
  let fixture: ComponentFixture<ChatAreaComponent>
  let mockOpencodeChatService: any

  beforeEach(async () => {
    mockOpencodeChatService = {
      messages: {
        sessionMessages: signal(null),
      },
    }

    await TestBed.configureTestingModule({
      imports: [ChatAreaComponent, FilterValidPartsPipe],
      providers: [{ provide: OpencodeChatService, useValue: mockOpencodeChatService }],
    }).compileComponents()

    fixture = TestBed.createComponent(ChatAreaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should display no session message when sessionMessages is null', () => {
    mockOpencodeChatService.messages.sessionMessages.set(null)
    fixture.detectChanges()

    const compiled = fixture.nativeElement
    expect(compiled.textContent).toContain('Create or select a session to start.')
  })
})
