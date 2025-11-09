import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { provideRouter } from '@angular/router'
import Aura from '@primeuix/themes/aura'
import { provideMarkdown } from 'ngx-markdown'
import { providePrimeNG } from 'primeng/config'
import { routes } from './app.routes'
import './prism'
import { ElectronService } from './shared'
import { Logger, LogLevel } from './shared/logger/logger.service'

if (ElectronService.isDev()) {
  Logger.setLogLevel(LogLevel.DEBUG)
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    provideMarkdown(),
  ],
}
