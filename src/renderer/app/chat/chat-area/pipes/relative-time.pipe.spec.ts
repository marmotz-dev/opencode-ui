import { RelativeTimePipe } from './relative-time.pipe'

describe('RelativeTimePipe', () => {
  let pipe: RelativeTimePipe

  beforeEach(() => {
    pipe = new RelativeTimePipe()
  })

  it('should create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return formatted date string for timestamp', () => {
    const timestamp = Date.now()
    const expectedDate = new Date(timestamp).toLocaleString()

    const result = pipe.transform(timestamp)

    expect(result).toBe(expectedDate)
  })

  it('should handle different timestamps', () => {
    const timestamp1 = 1609459200000 // January 1, 2021
    const timestamp2 = 1640995200000 // January 1, 2022

    const result1 = pipe.transform(timestamp1)
    const result2 = pipe.transform(timestamp2)

    expect(result1).toBe(new Date(timestamp1).toLocaleString())
    expect(result2).toBe(new Date(timestamp2).toLocaleString())
    expect(result1).not.toBe(result2)
  })

  it('should handle timestamp zero', () => {
    const timestamp = 0 // January 1, 1970
    const expectedDate = new Date(timestamp).toLocaleString()

    const result = pipe.transform(timestamp)

    expect(result).toBe(expectedDate)
  })

  it('should handle negative timestamps', () => {
    const timestamp = -86400000 // January 0, 1970 (1 day before epoch)
    const expectedDate = new Date(timestamp).toLocaleString()

    const result = pipe.transform(timestamp)

    expect(result).toBe(expectedDate)
  })

  it('should return "Invalid Date" for NaN timestamp', () => {
    const result = pipe.transform(NaN)

    expect(result).toBe('Invalid Date')
  })

  it('should handle null input', () => {
    const result = pipe.transform(null as any)

    // new Date(null) creates a valid date (January 1, 1970)
    expect(result).toBe(new Date(0).toLocaleString())
  })

  it('should handle undefined input', () => {
    const result = pipe.transform(undefined as any)

    // new Date(undefined) creates Invalid Date
    expect(result).toBe('Invalid Date')
  })
})
