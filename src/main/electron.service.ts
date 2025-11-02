import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, dialog, ipcMain, screen, shell } from 'electron'

export class ElectronService {
  private static app = app
  private static dev = is.dev
  private static dialog = dialog
  private static electronApp = electronApp
  private static ipcMain = ipcMain
  private static optimizer = optimizer
  private static screen = screen
  private static shell = shell

  static getApp() {
    return this.app
  }

  static getDialog() {
    return this.dialog
  }

  static getElectronApp() {
    return this.electronApp
  }

  static getIpcMain() {
    return this.ipcMain
  }

  static getOptimizer() {
    return this.optimizer
  }

  static getScreen() {
    return this.screen
  }

  static getShell() {
    return this.shell
  }

  static isDev() {
    return this.dev
  }
}
