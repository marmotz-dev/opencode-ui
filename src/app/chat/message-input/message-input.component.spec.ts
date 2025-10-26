import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { FaIconComponent, FaIconLibrary } from '@fortawesome/angular-fontawesome'
import { Button } from 'primeng/button'

import { OpencodeChatService } from '../../shared/opencode'
import { IconUi } from '../../shared/ui/icon/icon.ui'
import { TextareaUi } from '../../shared/ui/textarea/textarea.component'
import { MessageInputComponent } from './message-input.component'

describe('MessageInputComponent', () => {
  let component: MessageInputComponent
  let fixture: ComponentFixture<MessageInputComponent>
  let mockOpencodeChatService: any

  beforeEach(async () => {
    mockOpencodeChatService = {
      messages: {
        prompt: jest.fn(),
      },
    }

    await TestBed.configureTestingModule({
      imports: [FormsModule, Button, MessageInputComponent, IconUi, TextareaUi, FaIconComponent],
      providers: [
        { provide: OpencodeChatService, useValue: mockOpencodeChatService },
        {
          provide: FaIconLibrary,
          useValue: {
            addIcons: jest.fn(),
            getIconDefinition: jest.fn().mockReturnValue({
              prefix: 'fas',
              iconName: 'paper-plane',
              icon: [0, 0, [], [], ''],
            }),
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(MessageInputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with empty message', () => {
    expect((component as any).message()).toBe('')
  })

  it('should not send empty message', async () => {
    ;(component as any).message.set('   ')
    const event = new Event('submit')
    jest.spyOn(event, 'preventDefault')

    await component.onSend(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(mockOpencodeChatService.messages.prompt).not.toHaveBeenCalled()
  })

  it('should send valid message and clear input', async () => {
    const messageText = 'Hello, world!'
    ;(component as any).message.set(messageText)
    mockOpencodeChatService.messages.prompt.mockResolvedValue(undefined)

    const event = new Event('submit')
    jest.spyOn(event, 'preventDefault')

    await component.onSend(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(mockOpencodeChatService.messages.prompt).toHaveBeenCalledWith(messageText)

    // Wait for setTimeout
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect((component as any).message()).toBe('')
  })

  it('should trim whitespace from message', async () => {
    ;(component as any).message.set('  Hello, world!  ')
    mockOpencodeChatService.messages.prompt.mockResolvedValue(undefined)

    const event = new Event('submit')
    jest.spyOn(event, 'preventDefault')

    await component.onSend(event)

    expect(mockOpencodeChatService.messages.prompt).toHaveBeenCalledWith('Hello, world!')
  })
})
