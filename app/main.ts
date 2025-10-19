import { app, BrowserWindow, ipcMain, screen } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { OpencodeService } from './opencode.service.js'

let win: BrowserWindow | null = null
const args = process.argv.slice(1)
const serve = args.some((val) => val === '--serve')

const configPath = path.join(app.getPath('userData'), 'config.json')
let config: Record<string, any> = {}
if (fs.existsSync(configPath)) {
  const configRawContent = fs.readFileSync(configPath)
  config = JSON.parse(configRawContent.toString() ?? '{}')
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
function saveConfig() {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }

  saveTimer = setTimeout(() => {
    fs.writeFileSync(configPath, JSON.stringify(config))
  }, 1000)
}

function createWindow(): BrowserWindow {
  const size = screen.getPrimaryDisplay().workAreaSize

  // Create the browser window.
  win = new BrowserWindow({
    x: config.position?.[0] ?? 0,
    y: config.position?.[1] ?? 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,
      webSecurity: !serve,
    },
  })

  win.webContents.openDevTools()

  if (serve) {
    import('electron-debug').then((debug) => {
      debug.default({ isEnabled: true, showDevTools: true })
    })

    import('electron-reloader').then((reloader) => {
      const reloaderFn = (reloader as any).default || reloader
      reloaderFn(module)
    })
    win.loadURL('http://localhost:4220')
  } else {
    // Path when running electron executable
    let pathIndex = './index.html'

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html'
    }

    const fullPath = path.join(__dirname, pathIndex)
    const url = `file://${path.resolve(fullPath).replace(/\\/g, '/')}`
    win.loadURL(url)
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  win.on('move', async () => {
    config.position = win!.getPosition()
    saveConfig()
  })

  return win
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', async () => {
    setTimeout(async () => {
      const window = createWindow()

      // Set up IPC handlers for Opencode service
      const opencodeService = await OpencodeService.init(window)
      ipcMain.handle('opencode.session.create', () => opencodeService.createSession())
      ipcMain.handle('opencode.session.delete', (_event, sessionId: string) => opencodeService.deleteSession(sessionId))
      ipcMain.handle('opencode.session.get-all', () => opencodeService.getCurrentSessions())
      ipcMain.handle('opencode.session.messages.get-all', (_event, sessionId: string) =>
        opencodeService.getSessionMessages(sessionId)
      )
      ipcMain.handle('opencode.session.prompt', (_event, sessionId: string, message: string) =>
        opencodeService.prompt(sessionId, message)
      )
    }, 400)
  })

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })
} catch (e) {
  // Catch Error
  // throw e;
}
