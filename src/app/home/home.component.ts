import { Component } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { Button } from 'primeng/button'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [TranslateModule, Button],
})
export class HomeComponent {}
