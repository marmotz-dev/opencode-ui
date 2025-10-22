import { app, ipcMain, screen } from 'electron'
import { OpencoDesk } from './opencodesk.js'

try {
  const opencoDesk = new OpencoDesk(process.argv, app, ipcMain, screen)
  opencoDesk.init().catch(console.error)
} catch (e) {
  console.error(e)
}
