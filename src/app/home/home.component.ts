import { Component, signal } from '@angular/core'
import { ChatAreaComponent } from './chat-area/chat-area.component'
import { MessageInputComponent } from './message-input/message-input.component'
import { SessionListComponent } from './session-list/session-list.component'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [SessionListComponent, ChatAreaComponent, MessageInputComponent],
})
export class HomeComponent {
  messages = signal<Message[]>([])
  selectedConversationId = signal<string | null>(null)

  onSendMessage(message: string) {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    }
    this.messages.update((msgs) => [...msgs, newMessage])

    // Simuler une réponse IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Réponse automatique de l'IA.",
        sender: 'ai',
        timestamp: new Date(),
      }
      this.messages.update((msgs) => [...msgs, aiResponse])
    }, 1000)
  }
}
