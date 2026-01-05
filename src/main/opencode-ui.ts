import { BrowserWindow } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import icon from '../../resources/icons/opencode-ui.png?asset'
import { ElectronService } from './electron.service'
import { OpencodeService } from './opencode.service'
import { Model } from './opencode.types'

export class OpencodeUi {
  private mainWindow!: BrowserWindow
  private opencodeService!: OpencodeService
  private config: Record<string, any>
  private readonly configPath: string
  private saveTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    this.config = {
      title: 'Opencode UI',
    }
    this.configPath = join(ElectronService.getApp().getPath('userData'), 'config.json')
    this.loadConfig()
  }

  async init() {
    // Request single instance lock to prevent multiple instances
    const gotTheLock = ElectronService.getApp().requestSingleInstanceLock()

    if (!gotTheLock) {
      // Another instance is already running, quit this one
      ElectronService.getApp().quit()
      return
    }

    // Handle second instance launch - focus existing window
    ElectronService.getApp().on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore()
        }
        this.mainWindow.focus()
      }
    })

    this.setupAppEvents()
  }

  private async createWindow() {
    const size = ElectronService.getScreen().getPrimaryDisplay().workAreaSize

    // Create the browser window.
    this.mainWindow = new BrowserWindow({
      x: this.config.position?.[0] ?? 0,
      y: this.config.position?.[1] ?? 0,
      width: size.width,
      height: size.height,
      title: this.config.title,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: fileURLToPath(new URL('../preload/index.mjs', import.meta.url)),
        sandbox: false,
      },
    })

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      ElectronService.getShell().openExternal(details.url)

      return {
        action: 'deny',
      }
    })

    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url.startsWith('http') && !url.startsWith('http://localhost')) {
        event.preventDefault()
        ElectronService.getShell().openExternal(url)
      }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (ElectronService.isDev() && process.env['ELECTRON_RENDERER_URL']) {
      await this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      await this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    this.mainWindow.on('move', async () => {
      this.config.position = this.mainWindow!.getPosition()
      this.saveConfig()
    })
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
    ElectronService.getApp()
      .whenReady()
      .then(async () => {
        // Set app user model id for windows
        ElectronService.getElectronApp().setAppUserModelId('dev.marmotz.opencode-ui')

        ElectronService.getApp().on('browser-window-created', (_, window) => {
          ElectronService.getOptimizer().watchWindowShortcuts(window)
        })

        await this.createWindow()

        this.opencodeService = await OpencodeService.init(this.mainWindow)
        this.setupIPC()

        if (ElectronService.isDev()) {
          const updateTitleFromUrl = (_e: any, navigationEntry: string) => {
            this.mainWindow.setTitle(`${this.config.title} - ${navigationEntry}`)
          }

          this.mainWindow.webContents.on('did-navigate', updateTitleFromUrl)
          this.mainWindow.webContents.on('did-navigate-in-page', updateTitleFromUrl)
        }

        // Quit when all windows are closed.
        ElectronService.getApp().on('window-all-closed', () => {
          // On OS X it is common for applications and their menu bar
          // to stay active until the user quits explicitly with Cmd + Q
          if (process.platform !== 'darwin') {
            ElectronService.getApp().quit()
          }
        })

        ElectronService.getApp().on('before-quit', () => {
          this.opencodeService.closeServer()
        })

        ElectronService.getApp().on('activate', async () => {
          // On macOS it's common to re-create a window in the app when the
          // dock icon is clicked and there are no other windows open.
          if (BrowserWindow.getAllWindows().length === 0) {
            await this.createWindow()
          }
        })
      })
  }

  private setupIPC() {
    ElectronService.getIpcMain().handle('select-directory', async () => {
      const result = await ElectronService.getDialog().showOpenDialog(this.mainWindow!, {
        properties: ['openDirectory'],
      })

      return result.canceled ? null : result.filePaths[0]
    })

    ElectronService.getIpcMain().handle('opencode.agents.get', () => this.opencodeService.getAgents())
    ElectronService.getIpcMain().handle('opencode.config.get', () => this.opencodeService.getConfig())
    ElectronService.getIpcMain().handle('opencode.providers.get', () => this.opencodeService.getProviders())
    ElectronService.getIpcMain().handle('opencode.session.create', () => this.opencodeService.createSession())
    ElectronService.getIpcMain().handle('opencode.session.delete', (_, sessionId: string) =>
      this.opencodeService.deleteSession(sessionId)
    )
    ElectronService.getIpcMain().handle('opencode.session.rename', (_, sessionId: string, newName: string) =>
      this.opencodeService.renameSession(sessionId, newName)
    )
    ElectronService.getIpcMain().handle('opencode.session.messages.get-all', (_, sessionId: string) =>
      this.opencodeService.getSessionMessages(sessionId)
    )
    ElectronService.getIpcMain().handle(
      'opencode.session.prompt',
      (_, sessionId: string, message: string, model: Model) => this.opencodeService.prompt(sessionId, message, model)
    )
    ElectronService.getIpcMain().handle('opencode.path.get', () => this.opencodeService.getPath())
    ElectronService.getIpcMain().handle('opencode.project.get-all', () => this.opencodeService.getProjects())
    ElectronService.getIpcMain().handle('opencode.project.get-current', () => this.opencodeService.getCurrentProject())
    ElectronService.getIpcMain().handle('opencode.project.sessions', (_, projectPath: string) =>
      this.opencodeService.getProjectSessions(projectPath)
    )

    this.mainWindow.webContents.send('ipc-ready')

    this.mainWindow.webContents.on('did-finish-load', () => {
      this.mainWindow.webContents.send('ipc-ready')
    })
  }
}
