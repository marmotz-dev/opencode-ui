import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { enableProdMode, provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { provideRouter } from '@angular/router'

import { provideTranslateService } from '@ngx-translate/core'
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader'
import Aura from '@primeuix/themes/aura'
import { provideMarkdown } from 'ngx-markdown'
import { providePrimeNG } from 'primeng/config'
import { AppComponent } from './app/app.component'
import { Logger, LogLevel } from './app/shared/logger/logger.service'
import { environment } from './environments/environment'
import { mainRoutes } from './main.routes'
import './prism'

if (environment.env === 'production') {
  enableProdMode()
} else {
  Logger.setLogLevel(LogLevel.DEBUG)
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    }),
    provideRouter(mainRoutes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    provideMarkdown(),
  ],
}).catch((err) => console.error(err))
