import { LoggerService, LogLevel } from './logger.service'

describe('LoggerService', () => {
  let logger: LoggerService

  beforeEach(() => {
    logger = new LoggerService('TestLogger')
    LoggerService.setLogLevel(LogLevel.DEBUG)
  })

  it('should create', () => {
    expect(logger).toBeTruthy()
  })

  it('should log debug when level allows', () => {
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation()
    logger.debug('test message')
    expect(consoleSpy).toHaveBeenCalledWith('[DEBUG]', '[TestLogger]', 'test message')
    consoleSpy.mockRestore()
  })

  it('should not log debug when level is higher', () => {
    LoggerService.setLogLevel(LogLevel.INFO)
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation()
    logger.debug('test message')
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should log error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    logger.error('error message')
    expect(consoleSpy).toHaveBeenCalledWith('[ERROR]', '[TestLogger]', 'error message')
    consoleSpy.mockRestore()
  })

  it('should set log level', () => {
    LoggerService.setLogLevel(LogLevel.WARN)
    expect(LoggerService['currentLevel']).toBe(LogLevel.WARN)
  })
})
