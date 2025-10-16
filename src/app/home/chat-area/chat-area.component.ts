import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

@Component({
  selector: 'app-chat-area',
  imports: [CommonModule],
  templateUrl: './chat-area.component.html',
})
export class ChatAreaComponent {
  messages = input<Message[]>([])
  selectedConversationId = input<string | null>(null)
}
