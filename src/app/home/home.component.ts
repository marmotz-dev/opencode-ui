import { Component } from '@angular/core'
import { ChatAreaComponent } from './chat-area/chat-area.component'
import { MessageInputComponent } from './message-input/message-input.component'
import { SessionListComponent } from './session-list/session-list.component'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [SessionListComponent, ChatAreaComponent, MessageInputComponent],
})
export class HomeComponent {}
