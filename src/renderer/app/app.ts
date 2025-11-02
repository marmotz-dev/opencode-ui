import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: '#root',
  standalone: true,
  template: '<router-outlet />',
  imports: [RouterOutlet],
})
export class App {
  constructor() {
    window.electron.ipcRenderer.send('ping')
  }
}
