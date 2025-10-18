import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { OpencodeService } from '../../shared/opencode'
import { ReasoningPartComponent } from './components/reasoning-part/reasoning-part.component'
import { TextPartComponent } from './components/text-part/text-part.component'
import { ToolPartComponent } from './components/tool-part/tool-part.component'
import { FilterValidPartsPipe } from './pipes/filter-valid-parts.pipe'

@Component({
  selector: 'app-chat-area',
  imports: [CommonModule, FilterValidPartsPipe, TextPartComponent, ReasoningPartComponent, ToolPartComponent],
  templateUrl: './chat-area.component.html',
  host: {
    class: 'block',
  },
})
export class ChatAreaComponent {
  private readonly opencodeService = inject(OpencodeService)

  sessionMessages = this.opencodeService.sessionMessages
}
