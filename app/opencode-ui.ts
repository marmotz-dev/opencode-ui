import { BrowserWindow } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { OpencodeService } from './opencode.service.js'
import { Model } from './opencode.types.js'

export class OpencodeUi {
  private app: Electron.App
  private ipcMain: Electron.IpcMain
  private screen: Electron.Screen
  private win: BrowserWindow | null = null
  private opencodeService!: OpencodeService
  private args: string[]
  private readonly serve: boolean
  private config: Record<string, any>
  private readonly configPath: string
  private saveTimer: ReturnType<typeof setTimeout> | null = null

  constructor(argv: string[], app: Electron.App, ipcMain: Electron.IpcMain, screen: Electron.Screen) {
    this.app = app
    this.ipcMain = ipcMain
    this.screen = screen
    this.args = argv.slice(1)
    this.serve = this.args.some((val) => val === '--serve')
    this.config = {
      title: 'Opencode UI',
    }
    this.configPath = join(this.app.getPath('userData'), 'config.json')
    this.loadConfig()
  }

  async init() {
    this.setupAppEvents()
  }

  private async createWindow(): Promise<BrowserWindow> {
    const size = this.screen.getPrimaryDisplay().workAreaSize

    // Create the browser window.
    this.win = new BrowserWindow({
      x: this.config.position?.[0] ?? 0,
      y: this.config.position?.[1] ?? 0,
      width: size.width,
      height: size.height,
      title: this.config.title,
      webPreferences: {
        nodeIntegration: true,
        allowRunningInsecureContent: this.serve,
        contextIsolation: false,
        webSecurity: !this.serve,
      },
    })

    this.opencodeService = await OpencodeService.init(this.win)

    if (this.serve) {
      this.win.webContents.openDevTools()
    }

    if (this.serve) {
      import('electron-debug').then((debug) => {
        debug.default({ isEnabled: true, showDevTools: true })
      })

      import('electron-reloader').then((reloader) => {
        const reloaderFn = (reloader as any).default || reloader
        reloaderFn(module)
      })
      this.win.loadURL('http://localhost:4220')
    } else {
      const __dirname = dirname(fileURLToPath(import.meta.url))

      // Path when running electron executable
      let pathIndex = './index.html'

      if (existsSync(join(__dirname, '../dist/index.html'))) {
        // Path when running electron in local folder
        pathIndex = '../dist/index.html'
      }

      const fullPath = join(__dirname, pathIndex)
      const url = `file://${resolve(fullPath).replace(/\\/g, '/')}`
      this.win.loadURL(url)
    }

    // Emitted when the window is closed.
    this.win.on('closed', () => {
      // Dereference the window object, usually you would store window
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.win = null
    })

    this.win.on('move', async () => {
      this.config.position = this.win!.getPosition()
      this.saveConfig()
    })

    return this.win
  }

  private loadConfig() {
    if (existsSync(this.configPath)) {
      const configRawContent = readFileSync(this.configPath)
      this.config = {
        ...this.config,
        ...JSON.parse(configRawContent.toString() ?? '{}'),
      }
    }
  }

  private saveConfig() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
    this.saveTimer = setTimeout(() => {
      writeFileSync(this.configPath, JSON.stringify(this.config))
    }, 1000)
  }

  private setupAppEvents() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    this.app.on('ready', async () => {
      setTimeout(async () => {
        const window = await this.createWindow()

        if (this.serve) {
          const updateTitleFromUrl = (_e: any, navigationEntry: string) => {
            window.setTitle(`${this.config.title} - ${navigationEntry}`)
          }

          window.webContents.on('did-navigate', updateTitleFromUrl)
          window.webContents.on('did-navigate-in-page', updateTitleFromUrl)
        }

        this.setupIPC()
      }, 400)
    })

    // Quit when all windows are closed.
    this.app.on('window-all-closed', () => {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        this.app.quit()
      }
    })

    this.app.on('before-quit', () => {
      this.opencodeService.closeServer()
    })

    this.app.on('activate', async () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.win === null) {
        await this.createWindow()
      }
    })
  }

  private setupIPC() {
    this.ipcMain.handle('opencode.agents.get', () => this.opencodeService.getAgents())
    this.ipcMain.handle('opencode.config.get', () => this.opencodeService.getConfig())
    this.ipcMain.handle('opencode.providers.get', () => this.opencodeService.getProviders())
    this.ipcMain.handle('opencode.session.create', () => this.opencodeService.createSession())
    this.ipcMain.handle('opencode.session.delete', (_event, sessionId: string) =>
      this.opencodeService.deleteSession(sessionId)
    )
    this.ipcMain.handle('opencode.session.get-all', () => this.opencodeService.getCurrentSessions())
    this.ipcMain.handle('opencode.session.messages.get-all', (_event, sessionId: string) =>
      this.opencodeService.getSessionMessages(sessionId)
    )
    this.ipcMain.handle('opencode.session.prompt', (_event, sessionId: string, message: string, model?: Model) =>
      this.opencodeService.prompt(sessionId, message, model)
    )
    this.ipcMain.handle('opencode.project.get-all', () => this.opencodeService.getProjects())
    this.ipcMain.handle('opencode.project.get-current', () => this.opencodeService.getCurrentProject())
  }
}
