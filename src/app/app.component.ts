import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { environment } from '../environments/environment'
import { ElectronService } from './core/services'
import { OpencodeService } from './shared/opencode'

@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  imports: [RouterOutlet],
})
export class AppComponent {
  private electronService = inject(ElectronService)
  private translate = inject(TranslateService)
  private opencodeService = inject(OpencodeService)

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[])

  constructor() {
    const electronService = this.electronService

    this.translate.setFallbackLang('en')

    if (environment.env === 'development') {
      console.log('environment', environment)

      if (electronService.isElectron) {
        console.log('Run in electron')
        console.log('Electron ipcRenderer', this.electronService.ipcRenderer)
        console.log('NodeJS childProcess', this.electronService.childProcess)
        console.log('process.env', process.env)
      } else {
        console.log('Run in browser')
      }
    }

    // Set up event listener early to catch events from main
    this.opencodeService.onEvent((event: Electron.IpcRendererEvent, ...args: any[]) => {
      console.log('Opencode event received in app.component:', event, args)
    })
  }
}
