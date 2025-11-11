export class ElectronService {
  static getIpcRenderer() {
    return window.electron.ipcRenderer
  }

  static getWebFrame() {
    return window.electron.webFrame
  }

  static isDev() {
    return window.electron.process.env.NODE_ENV === 'development'
  }

  static async selectDirectory(): Promise<string | null> {
    return this.getIpcRenderer().invoke('select-directory')
  }

  static async closeApp(): Promise<void> {
    await this.getIpcRenderer().invoke('close-app')
  }
}
