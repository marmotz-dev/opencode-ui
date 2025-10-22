import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { FaIconLibrary } from '@fortawesome/angular-fontawesome'
import { faChevronUp, faPaperPlane, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons'
import { TranslateService } from '@ngx-translate/core'
import { environment } from '../environments/environment'
import { ElectronService } from './core/services'
import { Logger } from './shared/logger/logger.service'

@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  imports: [RouterOutlet],
})
export class AppComponent {
  private logger = new Logger(AppComponent.name)

  private electronService = inject(ElectronService)
  private translate = inject(TranslateService)

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[])

  constructor(library: FaIconLibrary) {
    library.addIcons(faPaperPlane, faPlusCircle, faTrash, faChevronUp)

    const electronService = this.electronService

    this.translate.setFallbackLang('en')

    if (environment.env === 'development') {
      this.logger.debug('environment', environment)

      if (electronService.isElectron) {
        this.logger.debug('Run in electron')
        this.logger.debug('Electron ipcRenderer', this.electronService.ipcRenderer)
        this.logger.debug('NodeJS childProcess', this.electronService.childProcess)
        this.logger.debug('process.env', process.env)
      } else {
        this.logger.debug('Run in browser')
      }
    }
  }
}
