import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core'
import { Router } from '@angular/router'
import { OpencodeChatService } from '../shared/opencode'

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class LoadingComponent {
  private opencodeChatService = inject(OpencodeChatService)
  private router = inject(Router)

  constructor() {
    effect(() => {
      if (this.opencodeChatService.isIpcReady()) {
        const redirectUrl = localStorage.getItem('redirectUrl')
        localStorage.removeItem('redirectUrl')

        if (redirectUrl) {
          this.router.navigateByUrl(redirectUrl)
        } else {
          this.router.navigate(['chat'])
        }
      }
    })
  }
}
