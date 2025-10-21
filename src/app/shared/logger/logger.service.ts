export enum LogLevel {
  DEBUG = 0,
  LOG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

export class LoggerService {
  private static currentLevel: LogLevel = LogLevel.LOG
  private readonly name?: string

  constructor(name?: string) {
    this.name = name
  }

  static setLogLevel(level: LogLevel): void {
    LoggerService.currentLevel = level
  }

  debug(...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(...this.decorateLogs(LogLevel.DEBUG, ...args))
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(...this.decorateLogs(LogLevel.ERROR, ...args))
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(...this.decorateLogs(LogLevel.INFO, ...args))
    }
  }

  log(...args: any[]): void {
    if (this.shouldLog(LogLevel.LOG)) {
      console.log(...this.decorateLogs(LogLevel.LOG, ...args))
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(...this.decorateLogs(LogLevel.WARN, ...args))
    }
  }

  private decorateLogs(logLevel: LogLevel, ...args: any[]): any[] {
    const message = ['[' + this.getLogLevelName(logLevel) + ']']

    if (this.name) {
      message.push('[' + this.name + ']')
    }

    return [...message, ...args]
  }

  private getLogLevelName(logLevel: LogLevel): string {
    switch (logLevel) {
      case LogLevel.DEBUG:
        return 'DEBUG'
      case LogLevel.LOG:
        return 'LOG'
      case LogLevel.INFO:
        return 'INFO'
      case LogLevel.WARN:
        return 'WARN'
      case LogLevel.ERROR:
        return 'ERROR'
      default:
        return 'UNKNOWN'
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= LoggerService.currentLevel
  }
}

// Alias pour faciliter l'utilisation
export const Logger = LoggerService
