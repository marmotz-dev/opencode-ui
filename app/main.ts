import { app, ipcMain, screen } from 'electron'
import { OpencodeUi } from './opencode-ui.js'

try {
  const opencodeUi = new OpencodeUi(process.argv, app, ipcMain, screen)
  opencodeUi.init().catch(console.error)
} catch (e) {
  console.error(e)
}
