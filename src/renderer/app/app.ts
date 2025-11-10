import { Component, inject } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'
import { FaIconLibrary } from '@fortawesome/angular-fontawesome'
import {
  faCheck,
  faChevronUp,
  faFolder,
  faPaperPlane,
  faPencil,
  faPlusCircle,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { KeyboardShortcutService } from './shared'

@Component({
  selector: '#root',
  standalone: true,
  template: '<router-outlet />',
  imports: [RouterOutlet],
})
export class App {
  private router = inject(Router)
  private keyboardShortcutService = inject(KeyboardShortcutService)

  constructor(library: FaIconLibrary) {
    this.keyboardShortcutService.init()

    library.addIcons(faCheck, faChevronUp, faFolder, faPaperPlane, faPencil, faPlusCircle, faTrash, faXmark)

    localStorage.setItem('redirectUrl', window.location.toString())
    this.router.navigate(['loading'])
  }
}
