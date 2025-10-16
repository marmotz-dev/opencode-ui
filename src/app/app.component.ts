import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { environment } from '../environments/environment'
import { ElectronService } from './core/services'

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet],
})
export class AppComponent {
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService
  ) {
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
  }
}
