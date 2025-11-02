import { Injectable } from '@angular/core'
import { IpcRenderer, WebFrame } from '@electron-toolkit/preload'

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: IpcRenderer
  webFrame: WebFrame

  constructor() {
    this.ipcRenderer = window.electron.ipcRenderer
    this.webFrame = window.electron.webFrame
  }

  async selectDirectory(): Promise<string | null> {
    return this.ipcRenderer.invoke('select-directory')
  }
}
