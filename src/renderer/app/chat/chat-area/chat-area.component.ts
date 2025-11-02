import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { OpencodeChatService } from '../../shared/opencode'
import { ReasoningPartComponent } from './components/reasoning-part/reasoning-part.component'
import { TextPartComponent } from './components/text-part/text-part.component'
import { ToolPartComponent } from './components/tool-part/tool-part.component'

import { FilterValidPartsPipe } from './pipes/filter-valid-parts.pipe'

@Component({
  selector: 'app-chat-area',
  imports: [FilterValidPartsPipe, TextPartComponent, ReasoningPartComponent, ToolPartComponent],
  templateUrl: './chat-area.component.html',
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatAreaComponent {
  private readonly opencodeChat = inject(OpencodeChatService)

  sessionMessages = this.opencodeChat.messages.sessionMessages
}
